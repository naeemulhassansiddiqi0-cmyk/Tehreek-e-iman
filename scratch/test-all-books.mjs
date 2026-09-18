const books = ['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah', 'malik'];

for (const b of books) {
  try {
    const res = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${b}/1.json`);
    const data = await res.json();
    console.log(b, '-> Hadith 1:', data.hadiths?.[0]?.hadithnumber, '| snippet:', data.hadiths?.[0]?.text?.slice(0, 50));
  } catch (err) {
    console.log(b, 'failed:', err.message);
  }
}
