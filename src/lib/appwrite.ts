import { Client, Account, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('69a6ab5f000b12b4f6b0');

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases };
