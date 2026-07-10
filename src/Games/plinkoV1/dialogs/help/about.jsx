import React from 'react';

const PlinkoHelpAbout = () => {
  return (
    <div className="help-content-container scroll-view">
      <div className="help-item">
        <h2>What Is Plinko?</h2>
        <div className="help-content">
          <p>
            Plinko is the peculiar game of chance played with a ball "plinking" down
            the vertical board populated with offset rows of pegs. represented the
            board in the form of a pyramid.
          </p>
          <p></p>
          <p>
            The gameplay is simple as it is: the player chooses from 8 to 16 rows,
            hoping the ball would fall into one of the chosen holes with the best
            payment, and just watches the "bouncing process through the obstacles"
            from the top of the pyramid down the board bottom. The ball eventually
            ends up at the bottom peg and determines the prize.
          </p>
          <p></p>
          <p>
            So welcome to the Plinko's plinkily intricate system, trust your luck
            and let the ball fall!
          </p>
        </div>
      </div>
      <div className="help-item">
        <h2>How To Play It?</h2>
        <p>
          Just enter your bet, choose the Odds, and then choose the bonus line. The
          number on the bonus line means how much your bet will be multiplied when
          the ball falls into a hole.
        </p>
        <p>If your brain doesn't want to think, choose our AUTO BOT.</p>
      </div>
    </div>
  );
};

export default PlinkoHelpAbout;
