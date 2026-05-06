import { REGIONS, getDistricts } from '../regions'
import { useT } from '../i18n'

export default function RegionSelect({ region, district, onRegion, onDistrict, light = false }) {
  const t = useT()
  const base = light
    ? 'bg-white border-[1.5px] border-[#E8EDF5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#1E6FD9] w-full'
    : 'bg-[#F4F7FB] border border-[#E2E8F0] rounded-xl px-3 py-3 text-[14px] outline-none focus:border-[#1E6FD9] w-full'

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold text-[#718096]">{t("Viloyat")}</label>
        <select
          value={region}
          onChange={e => { onRegion(e.target.value); onDistrict('') }}
          className={base}
        >
          <option value="">{t("— Viloyat tanlang —")}</option>
          {REGIONS.map(r => (
            <option key={r.id} value={r.id}>{t(r.name)}</option>
          ))}
        </select>
      </div>

      {region && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-[#718096]">{t("Tuman / Shahar")}</label>
          <select
            value={district}
            onChange={e => onDistrict(e.target.value)}
            className={base}
          >
            <option value="">{t("— Tuman tanlang —")}</option>
            {getDistricts(region).map(d => (
              <option key={d} value={d}>{t(d)}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
