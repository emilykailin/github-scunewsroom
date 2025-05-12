export function generateICS(event: {
  title: string;
  description: string;
  start: string;
  end: string;
  location: string;
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().replace(/[-:]/g, '').replace('.000Z', 'Z');
  };

  const escapeText = (text: string) =>
    text
      .replace(/\r\n|\n|\r/g, '\\n')
      .replace(/,/g, '\\,')        
      .replace(/;/g, '\\;');         

return `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${escapeText(event.title)}
DESCRIPTION:${escapeText(event.description)}
DTSTART:${formatDate(event.start)}
DTEND:${formatDate(event.end)}
LOCATION:${escapeText(event.location)}
END:VEVENT
END:VCALENDAR
`.trim();
}