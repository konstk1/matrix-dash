import { Configuration, OpenAIApi } from 'openai';


export class ChatGPT {
  private readonly openai: OpenAIApi;

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.openai = new OpenAIApi(configuration);
  }

  public async generate(prompt: string): Promise<string | undefined> {
    const response = await this.openai.createCompletion({
      model: "text-davinci-003",
      prompt,
    });

    return response.data.choices[0].text;
  }
}