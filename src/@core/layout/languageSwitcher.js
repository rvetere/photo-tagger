import { Fragment } from 'react'

const LanguageSwitcher = ({ languages, currentLang, updateGlobals }) => {
  const langs = languages.concat('en')
  return (
    <div>
      {langs.map((lang, index) => {
        const isActive = lang === currentLang
        const isLast = index === langs.length - 1
        return (
          <Fragment key={`lang-swticher-${lang}`}>
            <button disabled={isActive} onClick={() => updateGlobals({ locale: lang }) }>{lang}</button>
            {
              !isLast &&
              ' | '
            }
          </Fragment>
        )
      })}

      <style jsx>{`
        div {
          position: fixed;
          bottom: 10px;
          right: 0;
          width: 80px;
          height: 22px;
          text-align: center;
        }
      `}</style>
    </div>
  )
}

export default LanguageSwitcher
