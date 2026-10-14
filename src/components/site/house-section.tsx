import { BRAND, PLANS, SERVICES } from "@/content/lobeca";
import { LobecaMark } from "./brand";
import { CountUp, FadeUp, Marquee, Parallax, RevealClip, RevealWords } from "./motion";
import { Photo } from "./photo";

// A casa: os fatos públicos da marca contados com movimento — 11 anos, +450
// assinantes, as três palavras com que ela se apresenta — e a casa por dentro,
// em fotos reais. Nada de história inventada.
const VALUES = ["Profissionalismo", "Qualidade", "Estilo"];

export function HouseSection() {
  const stats = [
    { value: BRAND.members, prefix: "+", label: "membros assinantes" },
    { value: PLANS.length, prefix: "", label: "planos mensais" },
    { value: SERVICES.length, prefix: "", label: "serviços na carta" },
  ];

  return (
    <section aria-labelledby="casa-titulo" className="on-dark relative overflow-hidden bg-ink pt-[clamp(88px,12vw,176px)] text-paper">
      <div className="wrap grid gap-y-14 lg:grid-cols-12 lg:gap-x-8">
        <h2 id="casa-titulo" className="lg:col-span-7">
          <CountUp
            value={BRAND.years}
            duration={2}
            className="block font-display text-[clamp(10rem,34vw,24rem)] leading-[0.78] font-black tracking-[-0.04em]"
          />
          <RevealWords
            text={`anos de corte e barba\nem ${BRAND.city}.`}
            className="mt-6 block font-display text-[clamp(2rem,4.2vw,3.75rem)] leading-[1.02] font-extrabold tracking-[-0.015em]"
            delay={0.3}
          />
        </h2>

        <div className="flex flex-col justify-end gap-8 lg:col-span-4 lg:col-start-9 lg:pb-3">
          <RevealWords
            as="p"
            text="A Lobeca se apresenta com três palavras: profissionalismo, qualidade e estilo."
            className="lede text-paper"
            stagger={0.035}
          />
          <FadeUp delay={0.2}>
            <p className="max-w-[40ch] text-ash">
              Uma casa de barbeiros em {BRAND.city} que hoje atende mais de {BRAND.members} membros
              assinantes, com hora marcada.
            </p>
          </FadeUp>
        </div>
      </div>

      <dl className="wrap mt-16 grid grid-cols-3 gap-4 md:mt-24">
        {stats.map((s, i) => (
          <FadeUp key={s.label} delay={i * 0.12} className="glass flex flex-col rounded-[var(--radius-md)] px-4 py-5 md:px-7 md:py-7">
            <dt className="order-2 mt-2 block text-[0.82rem] leading-snug text-ash md:text-[0.95rem]">{s.label}</dt>
            <dd className="order-1 font-display text-[clamp(2rem,5vw,4rem)] leading-none font-black">
              <CountUp value={s.value} prefix={s.prefix} duration={1.8} />
            </dd>
          </FadeUp>
        ))}
      </dl>

      {/* Faixa com os três valores da marca, separados pela própria marca. */}
      <Marquee speed={32} className="mt-20 border-y border-white/12 py-6 md:mt-28 md:py-8">
        {[...VALUES, ...VALUES].map((word, i) => (
          <span key={i} className="flex items-center">
            <span
              className={`px-6 font-display text-[clamp(2.8rem,8vw,7rem)] leading-none font-extrabold tracking-[-0.02em] md:px-10 ${
                i % 2 ? "text-ash/70 italic" : "text-paper"
              }`}
            >
              {word}
            </span>
            <LobecaMark decorative className="h-[clamp(2.2rem,5vw,4.4rem)] text-paper/40" />
          </span>
        ))}
      </Marquee>

      {/* A casa por dentro: colagem em camadas, cada foto com seu ritmo. */}
      <div className="wrap relative grid grid-cols-12 gap-x-3 pt-20 pb-[clamp(96px,12vw,176px)] md:gap-x-8 md:pt-28">
        <Parallax offset={30} className="col-span-12 md:col-span-8">
          <RevealClip>
            <Photo name="equipe" ratio="3 / 2" focus="50% 30%" sizes="(min-width: 768px) 65vw, 100vw" />
          </RevealClip>
          <p className="caption mt-3 text-ash">A equipe da Lobeca.</p>
        </Parallax>

        <Parallax offset={90} className="col-span-7 col-start-6 -mt-16 md:col-span-4 md:col-start-9 md:mt-32">
          <RevealClip delay={0.15} from="right">
            <Photo name="salao" ratio="4 / 5" focus="40% 40%" sizes="(min-width: 768px) 30vw, 60vw" />
          </RevealClip>
          <p className="caption mt-3 text-ash">O salão.</p>
        </Parallax>

        <Parallax offset={140} className="relative z-10 col-span-6 col-start-1 -mt-40 md:col-span-3 md:col-start-6 md:-mt-[19rem]">
          <RevealClip delay={0.3} from="left">
            <Photo name="atendimento" ratio="4 / 5" focus="50% 30%" sizes="(min-width: 768px) 22vw, 50vw" className="ring-[10px] ring-ink" />
          </RevealClip>
        </Parallax>
      </div>
    </section>
  );
}
