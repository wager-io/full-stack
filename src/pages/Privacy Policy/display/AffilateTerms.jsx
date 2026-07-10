import React from 'react'

export default function AffilateTerms() {
  const containerStyle = {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    lineHeight: "1.6",
    maxHeight: "90vh",
    overflowY: "scroll",
    // border: "1px solid #ccc",
    borderRadius: "8px",
    margin: "20px auto",
    width: "90%",
  };

  const sectionHeader = {
    fontSize: "20px",
    fontWeight: "bold",
    marginTop: "30px",
    color: "white",
  };

  const subHeader = {
    fontSize: "16px",
    fontWeight: "bold",
    marginTop: "15px",
    color: "white",
  };

  const paragraph = {
    marginBottom: "10px",
  };

  const listItem = {
    marginBottom: "5px",
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: "center", fontSize: "28px", marginBottom: "20px", fontWeight: "bold", color: "white" }}>
        Stake Affiliate Terms
      </h1>

      <p style={paragraph}>
        These Affiliate Terms (“Terms”) govern participation in the Stake Affiliate Program (“Program”)
        operated by Medium Rare N.V. (trading as and referred to as “Stake” in these Terms) and
        operating the website stake.com (“Website”).
      </p>

      <p style={paragraph}>
        By participating in the Program or accepting these Terms, whichever is earlier (“Effective Date”),
        you agree to be bound by these Terms. These Terms, taken together with the Stake Terms and
        Conditions and Privacy Policy, form a binding agreement between you and Stake in relation
        to your participation in the Program (“Agreement”).
      </p>

      <h2 style={sectionHeader}>1. Services</h2>
      <p style={paragraph}><strong>1.1</strong> Stake hereby engages you to perform the services specified in Schedule A.</p>
      <p style={paragraph}><strong>1.2</strong> By participating, you agree to provide the Services as specified in Schedule B.</p>
      <p style={paragraph}><strong>1.3</strong> Stake will implement quality assurance mechanisms...</p>

      <h2 style={sectionHeader}>2. Term and Termination</h2>
      <p style={paragraph}><strong>2.1</strong> This Agreement commences on the Effective Date and continues until terminated...</p>
      <p style={paragraph}><strong>2.2</strong> You agree not to unilaterally change the scope of the Services.</p>
      <p style={paragraph}><strong>2.3</strong> Stake may terminate if it suspects illegal behavior...</p>

      <h2 style={sectionHeader}>3. Payment</h2>
      <ul>
        <li style={listItem}>Stake will pay you as specified in Schedule C.</li>
        <li style={listItem}>Stake may withhold payment in case of breach.</li>
        <li style={listItem}>You are responsible for your own taxes.</li>
      </ul>

      <h2 style={sectionHeader}>4. Eligibility</h2>
      <p style={paragraph}><strong>4.1</strong> You must meet the criteria in Schedule D to participate in the Program.</p>

      <h2 style={sectionHeader}>5. Warranties</h2>
      <ul>
        <li style={listItem}>You are not prohibited from using the Website.</li>
        <li style={listItem}>You have the authority to enter into this Agreement.</li>
        <li style={listItem}>You will not use misleading or fraudulent marketing tactics.</li>
      </ul>

      <h2 style={sectionHeader}>6. Intellectual Property</h2>
      <p style={paragraph}>
        All content you create becomes the property of Stake. You are granted a limited license to use Stake’s
        branding during the Term.
      </p>

      <h2 style={sectionHeader}>7. Limitation of Liability</h2>
      <p style={paragraph}>Stake is not liable for any indirect damages and limits liability to the Payment made in the past 12 months.</p>

      <h2 style={sectionHeader}>8. Indemnity</h2>
      <p style={paragraph}>You agree to indemnify Stake against third-party claims arising from your breach of this Agreement.</p>

      <h2 style={sectionHeader}>9. Use of Information</h2>
      <p style={paragraph}>You must protect all End User and Confidential Information and use it solely for the Program.</p>

      <h2 style={sectionHeader}>10. Relationship</h2>
      <p style={paragraph}>You are an independent contractor and not an employee of Stake.</p>

      <h2 style={sectionHeader}>11. Non-Disparagement</h2>
      <p style={paragraph}>You must not make negative statements about Stake.</p>

      <h2 style={sectionHeader}>12. Anti-Bribery</h2>
      <p style={paragraph}>You must comply with anti-bribery, anti-corruption, and AML laws.</p>

      <h2 style={sectionHeader}>13. Applicable Law</h2>
      <p style={paragraph}>This Agreement is governed by the laws of Curaçao, and the courts there have jurisdiction.</p>

      <h2 style={sectionHeader}>14. Amendments</h2>
      <p style={paragraph}>Stake may amend this Agreement at any time. Continued participation means acceptance.</p>

      <h2 style={sectionHeader}>15. Severance</h2>
      <p style={paragraph}>Invalid provisions will be modified or removed; the rest remains effective.</p>

      <h2 style={sectionHeader}>16. General Terms</h2>
      <ul>
        <li style={listItem}>This is the entire agreement between you and Stake.</li>
        <li style={listItem}>Notices are valid when sent via email.</li>
        <li style={listItem}>You may not assign this Agreement without written consent.</li>
      </ul>

      <h2 style={sectionHeader}>Schedules (A–D)</h2>
      <p style={paragraph}>The full schedules A, B, C, and D detail your services, standards, payment structure, and eligibility.</p>

      <p style={{ fontSize: "14px", marginTop: "40px", textAlign: "center", color: "white" }}>
        © {new Date().getFullYear()} Stake Affiliate Program Terms
      </p>
    </div>
  );
};


