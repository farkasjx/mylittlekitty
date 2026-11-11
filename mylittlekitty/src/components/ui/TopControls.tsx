import { LANGS, t, useLang } from '../../i18n'

export function TopControls({ onHelp }: { onHelp: () => void }) {
  const lang = useLang((s) => s.lang)
  const setLang = useLang((s) => s.setLang)
  return (
    <div className="mb-2 flex items-center justify-end gap-2">
      <div role="group" aria-label={t('top.language')} className="flex rounded-full bg-white/80 p-0.5 shadow-pop">
        {LANGS.map((l) => (
          <button
            key={l.id}
            onClick={() => setLang(l.id)}
            aria-pressed={lang === l.id}
            className={`rounded-full px-3 py-1 text-xs font-extrabold transition-colors ${lang === l.id ? 'bg-rose text-white' : 'text-cocoa-soft'}`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <button onClick={onHelp} className="flex items-center gap-1 rounded-full bg-white/80 px-3 py-1.5 text-xs font-extrabold shadow-pop">
        <span aria-hidden>❓</span> {t('top.help')}
      </button>
    </div>
  )
}
