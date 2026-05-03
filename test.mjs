import fs from 'fs';

let content = `
export default function Comp() {
  const t = useT();
  return (
    <div className="text-white">
      Salom dunyo
      <span>Ishlarim (12)</span>
      <button onClick={do}>Yangi qo'shish</button>
    </div>
  )
}
`;

content = content.replace(/>\s*([^<>{}\n]+?)\s*</g, (match, p1) => {
  if (p1.trim().length === 0) return match;
  if (/^[0-9\s.,+()-]+$/.test(p1)) return match; // skip only numbers/symbols
  return `>{t(\`${p1.trim()}\`)}<`;
});

console.log(content);
