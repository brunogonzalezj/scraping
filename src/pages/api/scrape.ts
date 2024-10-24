import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import * as cheerio from 'cheerio'

interface LinkInfo {
  text: string;
  href: string;
}

interface ContactInfo {
  links: LinkInfo[];
  text: string;
  emails: string[];
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { url } = req.body

  try {
    const response = await axios.get(url)
    const $ = cheerio.load(response.data)

    const footer = $('footer')
    const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/g;
    const footerText = footer.text().trim()
    const emails = footerText.match(emailRegex) || []

    const contactInfo: ContactInfo = {
      links: footer.find('a').map((i, el) => ({
        text: $(el).text().trim(),
        href: $(el).attr('href') || ''
      })).get(),
      text: footerText || 'No footer found',
      emails: emails
    }

    let responseText = `Footer text:\n${contactInfo.text}\n\nLinks:\n`;
    contactInfo.links.forEach(link => {
      responseText += `- ${link.text}: \n${link.href}\n`;
    });
    responseText += `\nEmails found:\n${emails.join('\n')}`;

    res.status(200).json({ responseText, contactInfo })
  } catch (error) {
    res.status(500).json({ error: error })
  }
}