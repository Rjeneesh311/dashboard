export const MOCK_DATA = {
    materials: [
        { id: 'M01', name: 'OPC Cement 53 Grade', cat: 'Cement', unit: 'Bags', reqQty: 850000, procQty: 612000, rate: 380, status: 'In Progress' },
        { id: 'M02', name: 'TMT Steel Bars Fe500D', cat: 'Steel', unit: 'Tonnes', reqQty: 12500, procQty: 10800, rate: 62000, status: 'On Track' },
        { id: 'M03', name: 'River Sand (Fine)', cat: 'Aggregates', unit: 'Cum', reqQty: 45000, procQty: 32000, rate: 1900, status: 'In Progress' },
        { id: 'M04', name: 'Crushed Stone 20mm', cat: 'Aggregates', unit: 'Cum', reqQty: 120000, procQty: 120000, rate: 1450, status: 'Completed' },
        { id: 'M05', name: 'Fly Ash Bricks', cat: 'Masonry', unit: 'Nos', reqQty: 3500000, procQty: 2450000, rate: 7.5, status: 'In Progress' },
        { id: 'M06', name: 'AAC Blocks 600x200x150', cat: 'Masonry', unit: 'Nos', reqQty: 800000, procQty: 560000, rate: 68, status: 'In Progress' },
        { id: 'M07', name: 'Ready-Mix Concrete M30', cat: 'Concrete', unit: 'Cum', reqQty: 95000, procQty: 72000, rate: 5400, status: 'In Progress' },
        { id: 'M08', name: 'Plywood 19mm BWR', cat: 'Formwork', unit: 'Sheets', reqQty: 18000, procQty: 15500, rate: 1800, status: 'On Track' },
        { id: 'M09', name: 'Vitrified Floor Tiles 600x600', cat: 'Finishing', unit: 'Sqm', reqQty: 65000, procQty: 28000, rate: 880, status: 'In Progress' },
        { id: 'M10', name: 'UPVC Pipes 110mm', cat: 'Plumbing', unit: 'Rmt', reqQty: 48000, procQty: 22000, rate: 235, status: 'In Progress' },
        { id: 'M11', name: 'Copper Wiring 2.5sqmm', cat: 'Electrical', unit: 'Rmt', reqQty: 180000, procQty: 135000, rate: 38, status: 'On Track' },
        { id: 'M12', name: 'Waterproofing Compound', cat: 'Chemicals', unit: 'Sqm', reqQty: 42000, procQty: 18000, rate: 265, status: 'In Progress' },
        { id: 'M13', name: 'Aluminium Doors & Frames', cat: 'Joinery', unit: 'Units', reqQty: 1200, procQty: 480, rate: 16500, status: 'In Progress' },
        { id: 'M14', name: 'uPVC Windows 2-track', cat: 'Joinery', unit: 'Units', reqQty: 2400, procQty: 960, rate: 12500, status: 'In Progress' },
        { id: 'M15', name: 'Ceramic Wall Tiles 300x450', cat: 'Finishing', unit: 'Sqm', reqQty: 35000, procQty: 14000, rate: 395, status: 'In Progress' }
    ],
    vendors: [
        { id: 'V01', name: 'Tata Tiscon Steel', loc: 'Jamshedpur, Jharkhand', contact: 'Rajesh Kumar', phone: '+91 98765 43210', email: 'rajesh@tatasteel.com', gst: '20AABCT1234A1Z5', cat: 'Steel', ontime: 96, quality: 'A', stars: 5, financial: 'Strong', years: 15, turnover: '₹500Cr+', score: 92 },
        { id: 'V02', name: 'UltraTech Cement Ltd', loc: 'Ahmedabad, Gujarat', contact: 'Priya Sharma', phone: '+91 87654 32109', email: 'priya@ultratech.com', gst: '24AABCU5678B2Z3', cat: 'Cement / RMC', ontime: 82, quality: 'A-', stars: 4, financial: 'Strong', years: 12, turnover: '₹200Cr+', score: 78 },
        { id: 'V03', name: 'HIL Ltd (Birla Aerocon)', loc: 'Ahmedabad, Gujarat', contact: 'Amit Patel', phone: '+91 76543 21098', email: 'amit@hil.com', gst: '24AABCH9012C3Z1', cat: 'Masonry', ontime: 90, quality: 'A', stars: 4, financial: 'Strong', years: 10, turnover: '₹80Cr+', score: 85 },
        { id: 'V04', name: 'Kajaria Ceramics Ltd', loc: 'Morbi, Gujarat', contact: 'Suresh Jain', phone: '+91 65432 10987', email: 'suresh@kajaria.com', gst: '24AABCK3456D4Z9', cat: 'Tiles / Finishing', ontime: 85, quality: 'A', stars: 4, financial: 'Strong', years: 8, turnover: '₹150Cr+', score: 83 },
        { id: 'V05', name: 'Havells India Ltd', loc: 'Vadodara, Gujarat', contact: 'Meera Shah', phone: '+91 54321 09876', email: 'meera@havells.com', gst: '24AABCH7890E5Z7', cat: 'Electrical', ontime: 91, quality: 'A-', stars: 4, financial: 'Strong', years: 20, turnover: '₹300Cr+', score: 88 },
        { id: 'V06', name: 'Astral Pipes Ltd', loc: 'Ahmedabad, Gujarat', contact: 'Kiran Desai', phone: '+91 43210 98765', email: 'kiran@astral.com', gst: '24AABCA1234F6Z5', cat: 'Plumbing', ontime: 78, quality: 'B+', stars: 3, financial: 'Moderate', years: 6, turnover: '₹40Cr+', score: 72 }
    ],
    pos: [
        { id: 'PO-2026-001', vendor: 'UltraTech Cement Ltd', material: 'OPC Cement 53 Grade', qty: 2000, unit: 'Bags', rate: 370, total: 740000, status: 'Sent to Vendor', date: '2026-03-15', by: 'Raiyani Jeneesh' },
        { id: 'PO-2026-002', vendor: 'Tata Tiscon Steel', material: 'TMT Steel Bars Fe500D', qty: 40, unit: 'Tonnes', rate: 58000, total: 2320000, status: 'Approved', date: '2026-03-18', by: 'Raiyani Jeneesh' },
        { id: 'PO-2026-003', vendor: 'Astral Pipes Ltd', material: 'UPVC Pipes 110mm', qty: 1500, unit: 'Rmt', rate: 220, total: 330000, status: 'Sent to Vendor', date: '2026-03-20', by: 'Raiyani Jeneesh' },
        { id: 'PO-2026-004', vendor: 'Kajaria Ceramics Ltd', material: 'Vitrified Floor Tiles', qty: 3000, unit: 'Sqm', rate: 850, total: 2550000, status: 'Pending Approval', date: '2026-03-22', by: 'Raiyani Jeneesh' },
        { id: 'PO-2026-005', vendor: 'Havells India Ltd', material: 'Copper Wiring 2.5sqmm', qty: 3000, unit: 'Rmt', rate: 35, total: 105000, status: 'Draft', date: '2026-03-25', by: 'Raiyani Jeneesh' }
    ],
    marketRates: {
        'OPC Cement': { unit: 'per Bag', rates: [310, 340, 355, 360, 370, 380] },
        'TMT Steel': { unit: 'per Tonne', rates: [48000, 52000, 56000, 54000, 58000, 60000] },
        'River Sand': { unit: 'per Cum', rates: [1200, 1400, 1500, 1600, 1800, 1900] },
        'Crushed Stone': { unit: 'per Cum', rates: [900, 1000, 1100, 1200, 1400, 1450] },
        'RMC M30': { unit: 'per Cum', rates: [4200, 4500, 4800, 5000, 5200, 5400] },
        'Fly Ash Bricks': { unit: 'per No', rates: [4.5, 5, 5.5, 6, 7, 7.5] },
        'Plywood 19mm': { unit: 'per Sheet', rates: [1200, 1350, 1500, 1600, 1750, 1800] }
    },
    notifications: [
        { time: 'Today, 10:30 AM', msg: '📝 PO PO-2026-002 created for TMT Steel Bars' },
        { time: 'Today, 09:15 AM', msg: '✅ Vendor Tata Tiscon confirmed delivery schedule' }
    ]
};
