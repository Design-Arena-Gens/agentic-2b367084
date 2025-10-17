import Chat from '../components/Chat';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Agentic LLM</h1>
      <p className="text-sm text-gray-300 mb-6">A lightweight, local LLM-like chat.
      </p>
      <Chat />
    </main>
  );
}
