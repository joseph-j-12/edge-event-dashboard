
"use client";

import { useEffect, useState } from "react";

type EventItem = {
    eventId: string;
    eventType: string;
    eventDate: string;
    eventTimestamp: string;
    cameraId: string;
    imageUrl?: string;
    contentType?: string;
};

export default function Home() {
    const [date, setDate] = useState(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    });
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedImage, setSelectedImage] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadEvents() {
            setLoading(true);
            setError("");

            try {
                const res = await fetch(
                    `/api/events?eventDate=${encodeURIComponent(date)}`,
                                        { cache: "no-store" }
                );
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Could not load events.");
                }

                if (!cancelled) setEvents(data.events ?? []);
            } catch (err) {
                if (!cancelled) {
                    setEvents([]);
                    setError(
                        err instanceof Error ? err.message : "Something went wrong."
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadEvents();
        return () => {
            cancelled = true;
        };
    }, [date]);

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-8">
        <div className="mx-auto max-w-7xl">
        <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
        Edge Vision
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
        Event Dashboard
        </h1>
        <p className="mt-2 text-slate-400">
        Face-detection events collected from your Raspberry Pi camera.
        </p>
        </header>

        <section className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm text-slate-400">Events on selected date</p>
        <p className="mt-2 text-3xl font-bold">
        {loading ? "…" : events.length}
        </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <label
        htmlFor="event-date"
        className="mb-2 block text-sm text-slate-400"
        >
        Filter by date
        </label>
        <input
        id="event-date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
        />
        </div>
        </section>

        {error && (
            <p className="mb-4 rounded-lg border border-red-900 bg-red-950 p-4 text-red-200">
            {error}
            </p>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 px-5 py-4">
        <h2 className="font-semibold">Event history</h2>
        </div>

        {loading ? (
            <p className="p-6 text-slate-400">Loading events…</p>
        ) : events.length === 0 ? (
            <p className="p-6 text-slate-400">
            No events found for this date.
            </p>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400">
            <tr>
            <th className="px-5 py-3">Image</th>
            <th className="px-5 py-3">Event type</th>
            <th className="px-5 py-3">Timestamp (UTC)</th>
            <th className="px-5 py-3">Camera</th>
            <th className="px-5 py-3">Event ID</th>
            </tr>
            </thead>
            <tbody>
            {events.map((item) => (
                <tr
                key={item.eventId}
                className="border-t border-slate-800 hover:bg-slate-800/60"
                >
                <td className="px-5 py-3">
                {item.imageUrl ? (
                    <button
                    type="button"
                    onClick={() => setSelectedImage(item.imageUrl!)}
                    title="Open image"
                    className="block"
                    >
                    <img
                    src={item.imageUrl}
                    alt={`${item.eventType} event`}
                    className="h-16 w-24 rounded-lg border border-slate-700 object-cover"
                    />
                    </button>
                ) : (
                    <span className="text-slate-500">No image</span>
                )}
                </td>
                <td className="px-5 py-3">
                <span className="rounded-full bg-cyan-950 px-3 py-1 text-cyan-300">
                {item.eventType}
                </span>
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-slate-300">
                {new Date(item.eventTimestamp).toLocaleString()}
                </td>
                <td className="px-5 py-3 text-slate-300">
                {item.cameraId}
                </td>
                <td className="max-w-48 truncate px-5 py-3 font-mono text-xs text-slate-400">
                {item.eventId}
                </td>
                </tr>
            ))}
            </tbody>
            </table>
            </div>
        )}
        </section>

        {selectedImage && (
            <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedImage("")}
            >
            <div
            className="relative max-h-[90vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
            >
            <button
            type="button"
            onClick={() => setSelectedImage("")}
            className="mb-3 rounded-lg bg-white px-4 py-2 font-semibold text-slate-900"
            >
            Close image ✕
            </button>
            <img
            src={selectedImage}
            alt="Selected event"
            className="max-h-[80vh] max-w-full rounded-xl object-contain"
            />
            </div>
            </div>
        )}

        <p className="mt-6 text-xs text-slate-500">
        Image links are temporary and expire after 15 minutes. Reload the
        dashboard to fetch fresh links.
        </p>
        </div>
        </main>
    );
}
