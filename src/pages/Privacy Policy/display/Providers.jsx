import React from 'react'

export default function Providers() {
  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', lineHeight: '1.6', overflowY: "scroll", maxHeight: "90vh",  }}>
          <h1 style={{ color: 'white', fontSize: '28px',  fontWeight: 'bold' }}>Provider Availability Policy</h1><br />

    <h2 style={{ color: 'white', fontSize: '17px',  fontWeight: 'bold' }}>1. Absolute Restriction</h2><br />
    <p>
      NetEnt will not permit NetEnt Casino Games to be supplied to any entity that operates in any of the below jurisdictions 
      (irrespective of whether or not NetEnt Casino Games are being supplied by the entity in that jurisdiction) 
      without the appropriate licenses.
    </p><br />
    <div class="territories">
      <strong>Restricted Jurisdictions:</strong> Belgium, Bulgaria, Colombia, Croatia, Czech Republic, Denmark, Estonia, France, Italy, Latvia, Lithuania, Mexico, Portugal, Romania, Spain, Sweden, Switzerland, United Kingdom, United States of America.
    </div><br />

    <h2 style={{ color: 'white', fontSize: '17px',  fontWeight: 'bold' }}>2. Blacklisted Territories</h2><br />
    <p>
      All NetEnt Casino Games may not be offered in the following territories:
    </p><br />
    <div class="territories">
      Afghanistan, Albania, Algeria, Angola, Australia, Bahamas, Botswana, Belgium, Bulgaria, Colombia, Croatia, Czech Republic, Denmark, Estonia, Ecuador, Ethiopia, France, Ghana, Guyana, Hong Kong, Italy, Iran, Iraq, Israel, Kuwait, Latvia, Lithuania, Mexico, Namibia, Nicaragua, North Korea, Pakistan, Panama, Philippines, Portugal, Romania, Singapore, Spain, Sweden, Switzerland, Sudan, Syria, Taiwan, Trinidad and Tobago, Tunisia, Uganda, United Kingdom, United States of America, Yemen, Zimbabwe.
    </div><br />

    <h2 style={{ color: 'white', fontSize: '17px',  fontWeight: 'bold' }}>3. Blacklisted Branded Games Territories</h2><br />
    <div class="branded-section">
      <h3><strong>i. Planet of the Apes</strong></h3>
      <p>Additional restricted territories: Azerbaijan, China, India, Malaysia, Qatar, Russia, Thailand, Turkey, Ukraine.</p>

      <h3><strong>ii. Vikings</strong></h3>
      <p>Additional restricted territories: Azerbaijan, Cambodia, Canada, China, France, India, Indonesia, Laos, Malaysia, Myanmar, Papua New Guinea, Qatar, Russia, South Korea, Thailand, Turkey, Ukraine, United States of America.</p>

      <h3><strong>iii. Narcos</strong></h3>
      <p>Additional restricted territories: Indonesia, South Korea.</p>

      <h3><strong>iv. Street Fighter</strong></h3>
      <p>Additional restricted territories: Anguilla, Antigua and Barbuda, Argentina, Aruba, Barbados, Bahamas, Belize, Bermuda, Bolivia, Bonaire, Brazil, British Virgin Islands, Canada, Cayman Islands, China, Chile, Clipperton Island, Columbia, Costa Rica, Cuba, Curacao, Dominica, Dominican Republic, El Salvador, Greenland, Grenada, Guadeloupe, Guatemala, Guyana, Haiti, Honduras, Jamaica, Japan, Martinique, Mexico, Montserrat, Navassa Island, Paraguay, Peru, Puerto Rico, Saba, Saint Barthelemy, Saint Eustatius, Saint Kitts and Nevis, Saint Lucia, Saint Maarten, Saint Martin, Saint Pierre and Miquelon, Saint Vincent and the Grenadines, South Korea, Suriname, Turks and Caicos Islands, United States of America, Uruguay, US Virgin Islands, Venezuela.</p>

      <h3><strong>v. Fashion TV</strong></h3>
      <p>Additional restricted territories: Cuba, Jordan, Turkey, Saudi Arabia.</p>
    </div><br />

    <h2 style={{ color: 'white', fontSize: '17px',  fontWeight: 'bold' }}>4. Universal Monsters (Dracula, Creature from the Black Lagoon, Phantoms Curse, The Invisible Man)</h2><br />
    <p>
      These games may only be played in the following territories:
    </p><br />
    <div class="territories">
      Andorra, Armenia, Azerbaijan, Belarus, Bosnia and Herzegovina, Georgia, Iceland, Liechtenstein, Moldova, Monaco, Montenegro, Norway, Russia, San Marino, Serbia, Ukraine, North Macedonia, Turkey, Austria, Cyprus, Finland, Germany, Greece, Hungary, Ireland, Luxembourg, Malta, Netherlands, Poland, Slovakia, Slovenia.
    </div>
  </div>
  )
}
