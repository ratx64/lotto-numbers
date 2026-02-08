import { useState } from "preact/hooks";
import { initialTicket, generateTicket } from "./functions/algorithm";
import euroJackpotData from "../eurojackpot_data.json";

import { Copyright } from "./components/Copyright";

export const App = () => {
  const [data, setData] = useState(initialTicket);

  const { numbers, starNumbers, strategy, rationale, disclaimer, closing } =
    data;

  const fetchNumbers = () => {
    const updatedData = generateTicket(euroJackpotData);
    setData(updatedData);
  };

  const formatNumber = (value: number) => value.toString().padStart(2, "0");

  return (
    <main className="app">
      <section className="disclaimer-banner">
        <p>{disclaimer}</p>
      </section>

      <header className="hero">
        <p className="eyebrow">EuroJackpot 2026</p>
        <h1>One Ticket. Clear Odds.</h1>
        <p className="subhead">
          A single, varied suggestion each click. No promises, no tricks.
        </p>
      </header>

      <section className="ticket-card">
        <div className="ticket-header">
          <div>
            <p className="label">Generated Ticket</p>
            <p className="strategy-pill">Strategy: {strategy}</p>
          </div>
          <button className="generate" onClick={fetchNumbers}>
            Generate
          </button>
        </div>

        <div className="numbers-grid">
          <div className="numbers-group">
            <h2>Main numbers</h2>
            <ul className="numbers-list main">
              {numbers.map((number) => (
                <li key={number}>{formatNumber(number)}</li>
              ))}
            </ul>
          </div>
          <div className="numbers-group">
            <h2>Euro numbers</h2>
            <ul className="numbers-list euro">
              {starNumbers.map((number) => (
                <li key={number}>{formatNumber(number)}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="insights">
        <article className="insight-card">
          <h3>Why this set</h3>
          <p>{rationale}</p>
        </article>
        <article className="insight-card">
          <h3>Responsible play</h3>
          <p>{closing}</p>
        </article>
      </section>

      <Copyright />
    </main>
  );
};
