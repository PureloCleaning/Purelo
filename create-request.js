export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // ── 1. Save to Airtable ──
    const airtableRes = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE}/Requests`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            'ID':            data.ref,
            'First Name':    data.firstName,
            'Last Name':     data.lastName,
            'Email':         data.email,
            'Phone':         data.phone,
            'Postcode':      data.postcode,
            'Property Type': data.service,
            'Clean Type':    data.cleanType,
            'Frequency':     data.frequency,
            'Hours':         Number(data.hours) || 0,
            'Date':          data.date,
            'Time':          data.time,
            'Notes':         data.notes || '',
            'Status':        'Request'
          }
        })
      }
    );

    const airtableResult = await airtableRes.json();

    if (airtableResult.error) {
      console.error('Airtable error:', JSON.stringify(airtableResult.error));
      return res.status(422).json(airtableResult);
    }

    // ── 2. Send confirmation email via Resend ──
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Purelo <info@purelo.co.uk>',
        to: data.email,
        subject: `Your Purelo quote request — ref ${data.ref}`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1c1c1c;">
            <div style="background: #3d5a47; padding: 32px 40px;">
              <h1 style="font-family: Georgia, serif; font-weight: 300; font-size: 32px; color: #faf8f4; margin: 0; letter-spacing: 4px;">Purelo</h1>
              <p style="color: rgba(255,255,255,0.5); font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 6px 0 0;">Professional Cleaning Services</p>
            </div>
            <div style="padding: 40px; background: #ffffff; border: 1px solid #e8e3da; border-top: none;">
              <p style="font-size: 16px; color: #1c1c1c; margin: 0 0 8px;">Hi ${data.firstName},</p>
              <p style="font-size: 15px; color: #7a7a72; line-height: 1.7; margin: 0 0 28px;">Thanks for getting in touch with Purelo. We've received your quote request and we're on it.</p>
              <div style="background: #eef3f0; border-left: 3px solid #3d5a47; padding: 20px 24px; margin-bottom: 28px;">
                <p style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #3d5a47; margin: 0 0 14px; font-family: Arial, sans-serif;">Your Request Summary</p>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr><td style="padding: 6px 0; color: #7a7a72; width: 40%;">Reference</td><td style="padding: 6px 0; font-weight: bold; color: #1c1c1c;">${data.ref}</td></tr>
                  <tr style="border-top: 1px solid rgba(61,90,71,0.1)"><td style="padding: 6px 0; color: #7a7a72;">Property</td><td style="padding: 6px 0; color: #1c1c1c;">${data.service}</td></tr>
                  <tr style="border-top: 1px solid rgba(61,90,71,0.1)"><td style="padding: 6px 0; color: #7a7a72;">Clean type</td><td style="padding: 6px 0; color: #1c1c1c;">${data.cleanType}</td></tr>
                  <tr style="border-top: 1px solid rgba(61,90,71,0.1)"><td style="padding: 6px 0; color: #7a7a72;">Frequency</td><td style="padding: 6px 0; color: #1c1c1c;">${data.frequency}</td></tr>
                  <tr style="border-top: 1px solid rgba(61,90,71,0.1)"><td style="padding: 6px 0; color: #7a7a72;">Hours</td><td style="padding: 6px 0; color: #1c1c1c;">${data.hours}</td></tr>
                  <tr style="border-top: 1px solid rgba(61,90,71,0.1)"><td style="padding: 6px 0; color: #7a7a72;">Preferred date</td><td style="padding: 6px 0; color: #1c1c1c;">${data.date} at ${data.time}</td></tr>
                  ${data.notes ? `<tr style="border-top: 1px solid rgba(61,90,71,0.1)"><td style="padding: 6px 0; color: #7a7a72;">Notes</td><td style="padding: 6px 0; color: #1c1c1c;">${data.notes}</td></tr>` : ''}
                </table>
              </div>
              <p style="font-size: 15px; color: #7a7a72; line-height: 1.7; margin: 0 0 12px;">We'll check availability and come back to you with a quote within <strong style="color: #1c1c1c;">24 hours</strong>.</p>
              <p style="font-size: 15px; color: #7a7a72; line-height: 1.7; margin: 0 0 28px;"><strong style="color: #1c1c1c;">Please keep an eye on your inbox</strong> — your clean is not confirmed until you reply to our quote email.</p>
              <p style="font-size: 14px; color: #7a7a72; line-height: 1.7; margin: 0;">Any questions, call or text us on <strong style="color: #1c1c1c;">07961 089 906</strong>.</p>
            </div>
            <div style="padding: 24px 40px; background: #f0ede8; border: 1px solid #e8e3da; border-top: none;">
              <p style="font-size: 12px; color: #7a7a72; margin: 0;">The Purelo Team &nbsp;·&nbsp;
                <a href="mailto:info@purelo.co.uk" style="color: #3d5a47; text-decoration: none;">info@purelo.co.uk</a>
                &nbsp;·&nbsp;
                <a href="https://purelo.co.uk" style="color: #3d5a47; text-decoration: none;">purelo.co.uk</a>
                &nbsp;·&nbsp; West London
              </p>
            </div>
          </div>
        `
      })
    });

    return res.status(200).json({ id: airtableResult.id });

  } catch (err) {
    console.error('Function error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
