import DropLogo from "../../components/DropLogo/DropLogo";
import Button from "../../components/Button/Button";
import { DropIcon, UsersIcon } from "../../components/icons";
import "./HomeScreen.css";

function HomeScreen({ onRequestBlood, onBecomeDonor, onLogin }) {
  return (
    <div className="home-page">
      <main className="home">
        <header className="home__brand">
          <DropLogo size="56px" />
          <span className="home__wordmark">
            Life<span>Drop</span>
          </span>
        </header>

        <section className="home__hero">
          <h1 className="home__title">Need blood right now?</h1>
          <p className="home__subtitle">
            Tell us what you need. We'll find donors near you.
          </p>

          <Button icon={<DropIcon />} onClick={onRequestBlood}>
            Request Blood
          </Button>
          <p className="home__promise">No account needed · Takes about a minute</p>
        </section>

        <section className="home__donor">
          <div className="home__divider">
            <span>or</span>
          </div>
          <Button variant="secondary" icon={<UsersIcon />} onClick={onBecomeDonor}>
            Become a Donor
          </Button>
        </section>

        <footer className="home__footer">
          Already have an account?{" "}
          <button type="button" className="home__link" onClick={onLogin}>
            Log In
          </button>
        </footer>
      </main>
    </div>
  );
}

export default HomeScreen;