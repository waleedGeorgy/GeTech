import { useForm } from '@tanstack/react-form'
import { createServerFn } from '@tanstack/react-start';
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import z from 'zod';
import { db } from '@/db';
import { badgeEnum, inventoryEnum, products } from '@/db/schema';
import type { BadgeValue, InventoryValue, ProductInsert } from '@/db/schema';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FieldError } from '@/components/ui/field';

export const Route = createFileRoute('/products/add/')({
  component: RouteComponent,
});

// Product schema
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Product description is required'),
  price: z.string().refine((value) => !isNaN(Number(value)), 'Product price must be a number').min(1, 'Product price is required'),
  image: z.url('Product image is required').max(512),
  inventory: z.enum(inventoryEnum.enumValues),
  badge: z.union([z.enum(badgeEnum.enumValues), z.undefined()])
});

// Server function for inserting a product into the DB
const createProduct = createServerFn({ method: "POST" })
  .inputValidator((data: ProductInsert) => data)
  .handler(async ({ data }) => {
    try {
      const results = await db.insert(products).values(data).returning();
      return results[0];
    } catch (error) {
      throw new Error();
    }
  })

function RouteComponent() {
  const navigate = useNavigate();

  const router = useRouter();

  // The main form for adding a product, using tanstack form
  const form = useForm({
    // Start off by defining the default values for the form fields
    defaultValues: {
      name: '',
      description: '',
      price: '',
      image: '',
      inventory: '' as InventoryValue,
      badge: undefined as BadgeValue | undefined,
    },
    /* Define any validators. Zod simplifies validation, we simply need to pass the validation schema
    to the action that needs to be validated (in this case it's submission). */
    validators: {
      onSubmit: productSchema,
    },
    // Define what happens on form submit
    onSubmit: async ({ value }) => {
      await createProduct({ data: value });
      await router.invalidate();
      navigate({ to: "/products" });
    }
  });

  return (
    <Card className='max-w-2xl mx-auto px-4 py-5'>
      <CardHeader>
        <CardTitle className='uppercase font-semibold text-accent text-sm'>Add product</CardTitle>
        <CardDescription>Fill in the form to add a new product to the catalogue.</CardDescription>
      </CardHeader>
      <CardContent className='mt-3'>
        {/* Now we populate the form with the tanstack form object we defined above */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            /* form object has the handleSubmit() function which designates the form we want to handle submissions from */
            form.handleSubmit();
          }}
          className='space-y-4'
          /* This stops in-browser validation, and makes tanstack form handle the validation,
          which makes any custom error messages appear */
          noValidate
        >
          {/* A form field is defined with the <FORM_OBJECT.Field> tag. It must be given a name that will be used
          everywhere inside the form field */}
          <form.Field name='name'>
            {/* Inside each form field we define a callback that takes in `field` as a parameter.
            This parameter contains all the data related to this form field. For example: */}
            {(field) => (
              <div className='flex flex-col gap-2 justify-center'>
                {/* 1- It contains the name given to it in the `name` tag of the <form.Field> */}
                <Label htmlFor={field.name}>Product name*</Label>
                <Input
                  type='text'
                  id={field.name}
                  name={field.name}
                  /* 2- handleBlur property which handle the blur event */
                  onBlur={field.handleBlur}
                  /* 3- The value of the input field, which is contained inside the `state` property. */
                  value={field.state.value}
                  /* 4- The `handleChange()` function which handles the onChange event */
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='Enter product name...'
                  aria-invalid={!field.state.meta.isValid}
                />
                {/* 5- Any errors generated when parsing the form input fields */}
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
          <form.Field name='description'>
            {(field) => (
              <div className='flex flex-col gap-2 justify-center'>
                <Label htmlFor={field.name}>Product description*</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='Enter product description...'
                  aria-invalid={!field.state.meta.isValid}
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
          <form.Field name='price'>
            {(field) => (
              <div className='flex flex-col gap-2 justify-center'>
                <Label htmlFor={field.name}>Product price*</Label>
                <Input
                  type='number'
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  value={field.state.value}
                  step='0.01'
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='$0.00'
                  aria-invalid={!field.state.meta.isValid}
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
          <form.Field name='image'>
            {(field) => {
              return (
                <div className='flex flex-col gap-2 justify-center'>
                  <Label htmlFor={field.name}>Product image*</Label>
                  <Input
                    type='url'
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder='https://example.com/image.jpg'
                    aria-invalid={!field.state.meta.isValid}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </div>
              );
            }}
          </form.Field>
          <form.Field name='inventory'>
            {(field) => (
              <div className='flex flex-col gap-2 justify-center'>
                <Label htmlFor={field.name}>Inventory status*</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value as InventoryValue)}
                >
                  <SelectTrigger className='w-full' id={field.name}>
                    <SelectValue placeholder='Select inventory status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {inventoryEnum.enumValues.map((badge) => (
                        <SelectItem key={badge} value={badge}>
                          {badge.charAt(0).toUpperCase() + badge.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {field.state.meta.errors.length > 0 && <FieldError>Inventory status is required</FieldError>}
              </div>
            )}
          </form.Field>
          <form.Field name='badge'>
            {(field) => (
              <div className='flex flex-col gap-2 justify-center'>
                <Label htmlFor={field.name}>Product badge (optional)</Label>
                <Select
                  value={field.state.value || 'no-badge'}
                  onValueChange={(value) => field.handleChange(value === "no-badge" ? undefined : value as BadgeValue)}
                >
                  <SelectTrigger className="w-full" id={field.name}>
                    <SelectValue placeholder="Select a badge" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="no-badge">No badge</SelectItem>
                    </SelectGroup>
                    <Separator />
                    <SelectGroup>
                      {badgeEnum.enumValues.map((badge) => (
                        <SelectItem key={badge} value={badge}>
                          {badge.charAt(0).toUpperCase() + badge.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
          <form.Subscribe selector={(state) => [state.isSubmitting]}>
            {([isSubmitting]) => (
              <div className='flex items-center gap-3'>
                <Button
                  type='submit'
                  disabled={isSubmitting}
                  className='flex-1 cursor-pointer hover:brightness-110 transition'
                >
                  {isSubmitting ? 'Adding...' : 'Add Product'}
                </Button>
                <Button variant='outline'
                  onClick={() => form.reset()}
                  disabled={isSubmitting}
                  className='px-6 cursor-pointer'
                >
                  Reset
                </Button>
              </div>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
    </Card>
  )
}
