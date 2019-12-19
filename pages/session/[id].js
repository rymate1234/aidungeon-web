import React, { useState } from "react";
import Head from "next/head";
import Style from "../../components/Style";
import get from "../../lib/basic-get";
import nookies from "nookies";
import Router from "next/router";
import ScrollToBottom from "react-scroll-to-bottom";
import { css } from "glamor";

const termCss = css({
  maxHeight: 600
});

const Session = props => {
  const { url } = props;
  const [history, setHistory] = useState(props.session.story);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const setField = e => {
    setInput(e.currentTarget.value);
  };
  const sendLine = async e => {
    e.preventDefault();

    const req = await fetch("/api/session/" + url.query.id, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text: input })
    });

    try {
      const session = await req.json();

      setInput("");
      if (session && !session.error) {
        setHistory(session);
        setError("");
      } else {
        setError(session ? session.error : "Timed out, AI Dungeon too slow");
      }
    } catch (e) {
      setError("Time out, AI Dungeon too slow");
    }
  };

  return (
    <div>
      <Head>
        <title>AIDungeon Web</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Style />

      <div className="hero">
        <h1 className="title">Currently Playing</h1>
      </div>

      <div className="row">
        <ScrollToBottom className={termCss}>
          <div className="terminal">
            {history.map((item, i) => (
              <div className={item.type} key={i}>
                {item.value}
              </div>
            ))}
            <form onSubmit={sendLine}>
              <input
                className="input"
                type="input"
                name="input"
                value={input}
                placeholder="Enter your action"
                onChange={setField}
              />
            </form>
          </div>
        </ScrollToBottom>
      </div>

      {error && (
        <div className="row">
          <h2>Error: {error}</h2>
        </div>
      )}
    </div>
  );
};

Session.getInitialProps = async ctx => {
  const cookies = nookies.get(ctx);
  const { req, res, query } = ctx;

  if (!cookies.auth) {
    if (res) {
      res.writeHead(302, {
        Location: "/"
      });
      return res.end();
    } else {
      return Router.push("/");
    }
  }

  if (ctx.req) {
    const session = await get(
      "https://api.aidungeon.io/sessions/" + query.id,
      cookies.auth
    );

    return { session };
  } else {
    const requestSessions = await fetch("/api/session/" + query.id, {
      method: "GET"
    });
    return {
      session: await requestSessions.json()
    };
  }
};

export default Session;
