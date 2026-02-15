"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) loadBookmarks();
    });
  }, []);

  async function loadBookmarks() {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    setBookmarks(data || []);
  }

  async function addBookmark() {
    if (!title || !url) return;

    await supabase.from("bookmarks").insert({
      title,
      url,
      user_id: user.id,
    });

    setTitle("");
    setUrl("");
    loadBookmarks();
  }

  async function deleteBookmark(id: string) {
    await supabase.from("bookmarks").delete().eq("id", id);
    loadBookmarks();
  }

  async function logout() {
    await supabase.auth.signOut();
    location.reload();
  }

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <button
          onClick={() =>
            supabase.auth.signInWithOAuth({ provider: "google" })
          }
        >
          Login with Google
        </button>
      </div>
    );
  }

  return (
    <main style={{ maxWidth: 500, margin: "auto" }}>
      <h2>Welcome {user.email}</h2>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <br /><br />

      <button onClick={addBookmark}>Add</button>

      <ul>
        {bookmarks.map((b) => (
          <li key={b.id}>
            <a href={b.url} target="_blank">{b.title}</a>
            {" "}
            <button onClick={() => deleteBookmark(b.id)}>
              ❌
            </button>
          </li>
        ))}
      </ul>

      <button onClick={logout}>Logout</button>
    </main>
  );
}