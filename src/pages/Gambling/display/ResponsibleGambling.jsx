import React from 'react'

export default function ResponsibleGambling() {
  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', lineHeight: '1.6', overflowY: "scroll", maxHeight: "90vh",  }}>
      <h1 style={{ color: 'white', fontSize: '28px',  fontWeight: 'bold', textAlign: 'center' }}>Responsible Gambling FAQ's</h1>

      <ol style={{ paddingLeft: '20px' }}>
        <li style={{ marginBottom: '20px' }}>
          <strong style={{ color: 'white', fontSize: '17px',  fontWeight: 'bold' }}>Isn't problem gambling just a financial problem?</strong>
          <p>
            No. Problem gambling is a behavioural addiction that has financial and other consequences.
            Even if the person pays off their gambling debts, they can still have other problems caused by gambling.
          </p>
        </li>

        <li style={{ marginBottom: '20px' }}>
          <strong style={{ color: 'white', fontSize: '17px',  fontWeight: 'bold' }}>Do you have to wager often to be considered as someone being affected by problem gambling?</strong>
          <p>
            It really doesn’t matter how often a person wagers. If a person’s gambling is causing emotional, physical,
            financial, relationship or other challenges for themselves and the people around them,
            then they are affected as a result of problem gambling.
          </p>
        </li>

        <li style={{ marginBottom: '20px' }}>
          <strong style={{ color: 'white', fontSize: '17px',  fontWeight: 'bold' }}>How much money do you have to lose before gambling is a problem?</strong>
          <p>
            The amount of money lost or won does not determine when gambling becomes problematic.
            Problem gambling is a behavioural addiction, of which negatively affects one's finances simply as a direct result of the addiction.
            While gambling can cause financial problems, it is not the only warning sign of a gambling problem.
            When gambling affects an individual’s relationships, job, mental, physical or financial well-being, it is problematic.
          </p>
        </li>

        <li style={{ marginBottom: '20px' }}>
          <strong style={{ color: 'white', fontSize: '17px',  fontWeight: 'bold' }}>Who is at risk for problem gambling?</strong>
          <p>
            Problem gambling does not discriminate and can impact anyone who gambles regardless of economic, social, cultural or educational levels.
            Anyone who gambles can develop a gambling problem.
            Certain factors can increase your risk of developing a gambling addiction: genetics, environment, medical history, and age may all play a role.
          </p>
        </li>

        <li style={{ marginBottom: '20px' }}>
          <strong style={{ color: 'white', fontSize: '17px',  fontWeight: 'bold' }}>How can I protect myself from problem gambling?</strong>
          <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
            <li>Educate yourself on the risks associated with gambling</li>
            <li>Understand that gambling is entertainment, not a source of income</li>
            <li>Use of Responsible Gambling tools plays a critical role in managing your gambling activities</li>
            <li>Budget for your gambling activities</li>
            <li>Avoid chasing losses or wins — no bet outcome is guaranteed</li>
            <li>When the fun stops, it is a clear indication that you need to stop</li>
          </ul>
        </li>

        <li style={{ marginBottom: '20px' }}>
          <strong style={{ color: 'white', fontSize: '17px',  fontWeight: 'bold' }}>What are responsible gambling interactions?</strong>
          <p>
            Responsible gambling interactions are communicated in the form of an email or software messaging.
            These interactions are aimed at promoting healthy gambling activity, assisting you in understanding
            the tools and resources available in order to manage your gambling activities. They typically include
            information about setting limits, recognising signs of problem gambling, and accessing support resources.
          </p>
        </li>
      </ol>

      <h2 style={{ color: 'white', fontSize: '17px',  fontWeight: 'bold' }}>Help Organizations</h2>
      <p>
        If you are worried about yourself, or if someone you know is having problems managing their gambling,
        there are several external support agencies that can assist with providing advice.
      </p>

      <div style={{ marginTop: '20px' }}>
        <p>
          <strong style={{ color: 'white', fontSize: '17px',  fontWeight: 'bold' }}>Gamblers Anonymous</strong><br />
          Website:{' '}
          <a href="https://gamblersanonymous.org/ga/" target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
            https://gamblersanonymous.org/ga/
          </a>
        </p>

        <p>
          <strong style={{ color: 'white', fontSize: '17px',  fontWeight: 'bold' }}>Gambling Therapy</strong><br />
          Website:{' '}
          <a href="https://www.gamblingtherapy.org/" target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
            https://www.gamblingtherapy.org/
          </a><br />
          Contact:{' '}
          <a href="mailto:support@gamblingtherapy.org" style={{ color: '#007bff' }}>
            support@gamblingtherapy.org
          </a>
        </p>

        <p>
          <strong>The National Council on Problem Gambling</strong><br />
          The National Council on Problem Gambling provides a range of resources, including answers to commonly asked questions,
          a gambling behavior self-assessment, information about treatment, and the National Problem Gambling Helpline
          to connect you with help in your state (Canada).<br />
          Tel: <a href="tel:+18004262537" style={{ color: '#007bff' }}>+1-800-426-2537</a><br />
          Chat:{' '}
          <a href="https://www.ncpgambling.org/help-treatment/chat/" target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
            https://www.ncpgambling.org/help-treatment/chat/
          </a>
        </p>
      </div>
    </div>
  );
}