import * as fs from 'fs';
import * as path from 'path';

// Função para decodificar QUOTED-PRINTABLE
const decodeQuotedPrintable = (input: string) =>
    input.replace(/=([A-Fa-f0-9]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

// Função para limpar pontos e vírgulas do nome
const cleanName = (name: string) => name.replace(/;+/g, '').trim();

// Função para processar o conteúdo do arquivo vCard
const processVCardContent = (content: string) => 
    content.split('END:VCARD').filter(Boolean).map(vCard => {
        const lines = vCard.split('\n').map(line => line.trim());
        const contact: { name?: string, fullName?: string, phones?: string[] } = {};

        lines.forEach(line => {
            if (line.startsWith('N:')) contact.name = cleanName(decodeQuotedPrintable(line.split(':')[1]));
            if (line.startsWith('FN:')) contact.fullName = cleanName(decodeQuotedPrintable(line.split(':')[1]));
            if (line.startsWith('TEL:')) contact.phones = [...(contact.phones || []), line.split(':')[1]];
        });

        return {
            name: contact.name || 'N/A',
            fullName: contact.fullName || 'N/A',
            phones: contact.phones || ['N/A']
        };
    });

// Função para salvar o conteúdo JSON
const saveContactsToJSONFile = (contacts: any[]) => {
    const dirPath = path.join(__dirname, 'contatos-em-json');
    const filePath = path.join(dirPath, 'contatos.json');

    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);
    fs.writeFileSync(filePath, JSON.stringify(contacts, null, 2));
    console.log(`Arquivo salvo com sucesso em: ${filePath}`);
};

// Ler e processar o arquivo vCard
const filePath = path.join(__dirname, 'contackts.vcf');
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return console.error('Erro ao ler o arquivo:', err);
    saveContactsToJSONFile(processVCardContent(data));
});
