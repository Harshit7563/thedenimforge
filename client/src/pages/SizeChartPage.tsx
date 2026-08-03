import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ruler } from 'lucide-react';
import {
  MENS_SIZE_CHART,
  WOMENS_SIZE_CHART,
  KIDS_SIZE_CHART,
  type SizeRow,
} from '../lib/sizeChart';

type ChartTab = 'mens' | 'womens' | 'kids';

const TABS: { id: ChartTab; label: string }[] = [
  { id: 'mens', label: "Men's" },
  { id: 'womens', label: "Women's" },
  { id: 'kids', label: 'Kids' },
];

const CHARTS: Record<ChartTab, SizeRow[]> = {
  mens: MENS_SIZE_CHART,
  womens: WOMENS_SIZE_CHART,
  kids: KIDS_SIZE_CHART,
};

function SizeTable({ rows }: { rows: SizeRow[] }) {
  return (
    <div className="overflow-x-auto border border-[#e4e7ec]">
      <table className="w-full text-sm min-w-[480px]">
        <thead>
          <tr className="bg-[#0f1724] text-white">
            <th className="py-3 px-4 text-left font-semibold tracking-wide">Size</th>
            <th className="py-3 px-4 text-left font-semibold tracking-wide">Waist</th>
            <th className="py-3 px-4 text-left font-semibold tracking-wide">Hip</th>
            <th className="py-3 px-4 text-left font-semibold tracking-wide">Inseam</th>
            <th className="py-3 px-4 text-left font-semibold tracking-wide">Length</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.size}
              className={`border-b border-[#e4e7ec] last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-[#f7f8fa]'}`}
            >
              <td className="py-3 px-4 font-semibold text-[#0f1724]">{row.size}</td>
              <td className="py-3 px-4 text-[#5c6775]">{row.waist}</td>
              <td className="py-3 px-4 text-[#5c6775]">{row.hip}</td>
              <td className="py-3 px-4 text-[#5c6775]">{row.inseam}</td>
              <td className="py-3 px-4 text-[#5c6775]">{row.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SizeChartPage() {
  const [tab, setTab] = useState<ChartTab>('mens');

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <nav className="text-xs text-[#5c6775] mb-6">
        <Link to="/" className="hover:text-[#0f1724]">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-[#0f1724]">Size Chart</span>
      </nav>

      <div className="flex items-start gap-3 mb-3">
        <Ruler className="text-[#c41e3a] mt-1 shrink-0" size={28} strokeWidth={1.75} />
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-[#c41e3a] font-semibold mb-1">Fit guide</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0f1724] tracking-tight">
            Size Chart
          </h1>
        </div>
      </div>
      <p className="text-[#5c6775] mb-8 max-w-2xl leading-relaxed">
        Use these measurements to pick the right wholesale jeans size. Values are in inches and approximate —
        fabric stretch and wash can vary slightly by style.
      </p>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-[#e4e7ec] pb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 text-sm font-semibold transition ${
              tab === t.id
                ? 'bg-[#0f1724] text-white'
                : 'bg-[#eef1f5] text-[#5c6775] hover:text-[#0f1724]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <SizeTable rows={CHARTS[tab]} />

      <section className="mt-12 pt-10 border-t border-[#e4e7ec]">
        <h2 className="font-display text-xl font-bold text-[#0f1724] mb-6">How to measure</h2>
        <div className="grid sm:grid-cols-2 gap-6 text-sm text-[#5c6775] leading-relaxed">
          <div>
            <p className="font-semibold text-[#0f1724] mb-1">Waist</p>
            <p>Measure around the natural waistline, keeping the tape snug but not tight.</p>
          </div>
          <div>
            <p className="font-semibold text-[#0f1724] mb-1">Hip</p>
            <p>Measure around the fullest part of the hips, usually 7–9&quot; below the waist.</p>
          </div>
          <div>
            <p className="font-semibold text-[#0f1724] mb-1">Inseam</p>
            <p>Measure from the crotch seam down the inside of the leg to the hem.</p>
          </div>
          <div>
            <p className="font-semibold text-[#0f1724] mb-1">Length</p>
            <p>Full outseam from top of waistband to bottom of leg hem.</p>
          </div>
        </div>
        <p className="mt-8 text-sm text-[#5c6775]">
          Bulk / custom size runs available for wholesale buyers.{' '}
          <Link to="/contact" className="text-[#c41e3a] font-semibold hover:underline">
            Contact us
          </Link>{' '}
          or join the{' '}
          <Link to="/wholesale" className="text-[#c41e3a] font-semibold hover:underline">
            wholesale program
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
