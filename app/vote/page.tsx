import VoteForm from "./vote-form";
import BackButton from "../BackButton";

export default function VotePage() {
  return (
    <section>
      <div className="mb-4 md:mb-6">
        <BackButton fallbackUrl="/" />
      </div>
      <h1 className="text-4xl font-bold mb-2">Vote for your favorite look</h1>
      <p className="text-slate-600 mb-8">Enter your email, phone number, and the product ID to vote.</p>
      <VoteForm />
    </section>
  );
}
