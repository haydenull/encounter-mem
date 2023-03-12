## Encounter-mem

Encounter-mem is a tool designed to help users remember new words encountered in everyday life. It allows users to select and save words from sentences they come across, and generates example sentences using OpenAI's GPT-3 API.

### Features

- Select and save words from encountered sentences
- Generate example sentences using OpenAI's GPT-3 API
- Engage in a conversation with OpenAI centered around the selected word, with conversation topics limited by user-set profession and interests
- One-click deployment on Vercel

### Demo

You can try out an example demo of encounter-mem by visiting [https://encounter.haydenhayden.com](https://encounter.haydenhayden.com).

### Prerequisites

Before deploying encounter-mem, you'll need to complete the following steps:

1. Create a [Supabase](https://supabase.io/) account
2. Create a new database in Supabase and make note of your database URL and API key
3. Obtain an API key for OpenAI's GPT-3 API
4. Set up environment variables for your Supabase database credentials, OpenAI API key, and OpenAI server URL in Vercel (you can find instructions on how to do this in the [Vercel documentation](https://vercel.com/docs/environment-variables))

### Deployment

To deploy encounter-mem to Vercel, click the button below or use this [link](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fhayden-hayden%2Fencounter-mem):

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fhayden-hayden%2Fencounter-mem)

Once deployed, you can start using encounter-mem to select and save words, generate example sentences, and converse with OpenAI.

### Required Environment Variables

Encounter-mem requires the following environment variables to be set in Vercel:

- `NEXT_PUBLIC_OPENAI_API_KEY`: Your OpenAI API key
- `NEXT_PUBLIC_OPENAI_SERVER`: The URL for the OpenAI server (`https://api.openai.com`)
- `DATABASE_URL`: The connection string for your Supabase database
- `NEXTAUTH_SECRET`: Any value will work for this variable, but it must be set
- `DISCORD_CLIENT_ID`: Any value will work for this variable, but it must be set
- `DISCORD_CLIENT_SECRET`: Any value will work for this variable, but it must be set

### Setting Profession and Interests

To set your profession and interests, you can navigate to the Profile page in encounter-mem and update the corresponding fields. This will allow the AI to limit its conversation topics to those related to your profession and interests.

### :warning: Note

Please be aware that encounter-mem is still in its early stages, and the database may be subject to change or reset at any time. Use at your own risk.

### Contributing

If you'd like to contribute to encounter-mem, please fork the repository and create a pull request with your changes. Be sure to include detailed descriptions of your changes and any relevant tests or documentation updates.

### License

Encounter-mem is licensed under the [MIT License](https://opensource.org/licenses/MIT).
