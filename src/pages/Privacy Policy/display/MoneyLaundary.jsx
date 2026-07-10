import React from 'react'

export default function MoneyLaundary() {
  const sectionStyle = {
    marginBottom: '20px',
    lineHeight: '1.6',
    fontSize: '16px',
    
  };

  const headingStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: 'white',
  };

  const subHeadingStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginTop: '15px',
    marginBottom: '5px',
    color: 'white',
  };

  const containerStyle = {
    padding: '30px',
    fontFamily: 'Arial, sans-serif',
    // backgroundColor: '#f9f9f9',
    borderRadius: '10px',
    maxHeight: "90vh",
    overflowY: "scroll",
    maxWidth: '1200px',
    margin: 'auto',
  };

  return (
    <div style={containerStyle}>
      <div style={sectionStyle}>
        <div style={headingStyle}>1. Company Business Model</div>
        <p>
          Medium Rare N.V. (“Stake” or the “Company”) is a company incorporated under Curaçao Law that was established in 2017 and operates the online casino www.stake.com. Stake is licensed by the Curaçao Gaming Authority under license number OGL/2024/1451/0918. Stake presently supports users in more than 169 countries globally.
        </p>
        <p>
          As part of its global operations, Stake has established compliance measures commensurate with its services and products that are reasonably designed to deter and detect illicit activity on its platform. Such measures include onboarding and compliance screenings of its customers and transaction action-based controls.
        </p>
      </div>

      <div style={sectionStyle}>
        <div style={headingStyle}>2. Company Policy Statement</div>
        <p>
          Stake is not a financial institution within the meaning of applicable law of Curaçao and is accordingly not directly subject to the statutes and regulations applicable to certain financial institutions, money transfer, or virtual asset service providers. However, in accordance with the 2016 Regulations for Anti-Money Laundering and Combating the Financing of Terrorism (“AML/CFT”) applicable for the Curaçao jurisdiction as provided by the Curaçao Gaming Control Board, Stake expressly prohibits and rejects the use of Stake products for any form of illicit activity, including money laundering, terrorist financing or trade sanctions violations...
        </p>
        <p>
          Stake’s intention is to follow global best practices in guarding against Stake products being used to facilitate such activities. Those best practices include:
          <ul>
            <li>Adoption of a written policy, and procedures and controls;</li>
            <li>Designation of a compliance officer;</li>
            <li>Provision of training to relevant personnel;</li>
            <li>Independent reviews and monitoring of the policy.</li>
          </ul>
        </p>
      </div>

      <div style={sectionStyle}>
        <div style={headingStyle}>3. Definitions</div>
        <div style={subHeadingStyle}>Money Laundering:</div>
        <p>The process of making illegally-gained proceeds appear legal.</p>

        <div style={subHeadingStyle}>Placement:</div>
        <p>The process of placing unlawful proceeds into financial institutions.</p>

        <div style={subHeadingStyle}>Layering:</div>
        <p>The process of separating proceeds of criminal activity from their origin via complex transactions.</p>

        <div style={subHeadingStyle}>Integration:</div>
        <p>Using legitimate transactions to disguise illicit proceeds.</p>

        <div style={subHeadingStyle}>Suspicious Activity:</div>
        <p>Activity that may be linked to fraud or illegal purposes.</p>

        <div style={subHeadingStyle}>Sanctions:</div>
        <p>International restrictions to influence or punish unlawful conduct.</p>
      </div>

      <div style={sectionStyle}>
        <div style={headingStyle}>4. Governance and Oversight</div>
        <p>
          Stake has appointed a Chief Compliance Officer (“CCO”) who oversees the AML Policy, updates regulations, investigates suspicious activity, and provides training to employees.
        </p>
      </div>

      <div style={sectionStyle}>
        <div style={headingStyle}>5. Know Your Customer and Transaction Monitoring</div>
        <p>
          Stake applies user due diligence and ongoing monitoring. This includes the Customer Identification Program (CIP), identity verification, risk profiling, screening against sanctions, and transaction controls.
        </p>
        <p>
          Enhanced Due Diligence (EDD) is conducted when red flags are triggered. Stake collects full user information and sources of funds, and blocks users from high-risk jurisdictions or who provide false documentation.
        </p>
      </div>

      <div style={sectionStyle}>
        <div style={headingStyle}>6. Education and Training</div>
        <p>
          Stake may provide employees with AML, anti-terrorist financing, and sanctions compliance training periodically, as overseen by legal counsel and the CCO.
        </p>
      </div>

      <div style={sectionStyle}>
        <div style={headingStyle}>7. Reporting</div>
        <p>
          Stake reports suspicious transactions in accordance with the National Ordinance and will report any activity linked to criminal conduct or persons listed on sanctions databases to the appropriate regulators.
        </p>
      </div>
    </div>
  );
}