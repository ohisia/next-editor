// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { Configuration, OpenAIApi } from "openai";
import axios from "axios";

export default async function handler(req, res) {

  const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
  const heliconeKey = process.env.NEXT_PUBLIC_HELICONE_API_KEY
  const url = process.env.NEXT_PUBLIC_UPLOAD_IMAGE_DOMAIN

  try {
    const configuration = new Configuration( {
      apiKey: openaiKey,
    } );

    const openAiApi = new OpenAIApi( configuration );

    const stream = await axios.get(req.body.url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(stream.data);
    buffer.name = 'image.png'

    const response = await openAiApi.createImageVariation( 
        buffer,
        2,
        "256x256",
    );
    
    const imageArray = response.data.data;
    let newArray = []

    const promises = imageArray.map((image) => {
      return axios.post(`${url}/files/import`, {
          url: image.url
        }
      )
    })

    const upload = await Promise.all(promises)
    upload.forEach((image) => {
      newArray.push({ url: `${url}/assets/${image.data.data.id}`})
    })

    res.send( newArray )
  }
  catch (error) {
    console.error(error)
  }
      
}
  