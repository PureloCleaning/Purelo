export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

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
      return res.status(422).json(airtableResult);
    }

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
        html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto"><div style="background:#3d5a47;padding:32px 40px"><h1 style="font-weight:300;font-size:32px;color:#faf8f4;margin:0;letter-spacing:4px">Purelo</h1><p style="color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:6px 0 0">Professional Cleaning Services</p></div><div style="padding:40px;background:#fff;border:1px solid #e8e3da;border-top:none"><p style="font-size:16px">Hi ${data.firstName},</p><p style="font-size:15px;color:#7a7a72;line-height:1.7;margin:16px 0">Thanks for getting in touch. We've received your quote request and we're on it.</p><div style="background:#eef3f0;border-left:3px solid #3d5a47;padding:20px 24px;margin:24px 0"><table style="width:100%;font-size:14px;border-collapse:collapse"><tr><td style="padding:6px 0;color:#7a7a72;width:40%">Reference</td><td style="font-weight:bold">${data.ref}</td></tr><tr style="border-top:1px solid rgba(61,90,71,0.1)"><td style="padding:6px 0;color:#7a7a72">Property</td><td>${data.service}</td></tr><tr style="border-top:1px solid rgba(61,90,71,0.1)"><td style="padding:6px 0;color:#7a7a72">Clean type</td><td>${data.cleanType}</td></tr><tr style="border-top:1px solid rgba(61,90,71,0.1)"><td style="padding:6px 0;color:#7a7a72">Frequency</td><td>${data.frequency}</td></tr><tr style="border-top:1px solid rgba(61,90,71,0.1)"><td style="padding:6px 0;color:#7a7a72">Hours</td><td>${data.hours}</td></tr><tr style="border-top:1px solid rgba(61,90,71,0.1)"><td style="padding:6px 0;color:#7a7a72">Date</td><td>${data.date} at ${data.time}</td></tr></table></div><p style="font-size:15px;color:#7a7a72;line-height:1.7">We'll check availability and send you a quote within <strong style="color:#1c1c1c">24 hours</strong>. <strong style="color:#1c1c1c">Please check your inbox</strong> — your clean is not confirmed until you reply.</p><p style="font-size:14px;color:#7a7a72;margin-top:16px">Questions? Call or text <strong style="color:#1c1c1c">07961 089 906</strong>.</p></div><div style="padding:24px 40px;background:#f0ede8;border:1px solid #e8e3da;border-top:none"><p style="font-size:12px;color:#7a7a72;margin:0">The Purelo Team · <a href="mailto:info@purelo.co.uk" style="color:#3d5a47">info@purelo.co.uk</a> · <a href="https://purelo.co.uk" style="color:#3d5a47">purelo.co.uk</a></p></div></div>`
      })
    });

    return res.status(200).json({ id: airtableResult.id });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
