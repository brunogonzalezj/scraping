import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LinkInfo {
  text: string;
  href: string;
}

interface ContactInfo {
  links: LinkInfo[];
  text: string;
  emails: string[];
}

interface ScrapeResult {
  responseText: string;
  contactInfo: ContactInfo;
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<ScrapeResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error:', error)
      setResult(null)
    }
    setLoading(false)
  }

  return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>University Footer Scraper</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter university website URL"
                  required
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Scraping...' : 'Scrape Footer'}
              </Button>
            </form>
            {result && (
                <div className="mt-4">
                  <h2 className="text-lg font-semibold">Results:</h2>
                  <pre className="mt-2 p-4 bg-gray-100 rounded-md overflow-x-auto whitespace-pre-wrap">
                {result.responseText}
              </pre>
                  <div className="mt-4">
                    <h3 className="text-md font-semibold">Structured Data:</h3>
                    <p className="mt-2"><strong>Footer Text:</strong> {result.contactInfo.text}</p>
                    <p className="mt-2"><strong>Links:</strong></p>
                    <ul className="list-disc pl-5">
                      {result.contactInfo.links.map((link, index) => (
                          <li key={index}>
                            <strong>{link.text}:</strong> <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{link.href}</a>
                          </li>
                      ))}
                    </ul>
                    <p className="mt-2"><strong>Emails:</strong></p>
                    <ul className="list-disc pl-5">
                      {result.contactInfo.emails.map((email, index) => (
                          <li key={index}>{email}</li>
                      ))}
                    </ul>
                  </div>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
  )
}