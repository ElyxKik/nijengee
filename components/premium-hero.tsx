import Link from "next/link";
import {BrandIcon} from "./brand-icon";
import {BrandMark} from "./brand-mark";
import styles from "./premium-hero.module.css";
export function PremiumHero(){return <section className={styles.hero} aria-labelledby="hero-title">
 <img src="/images/nijengee-architecture.webp" srcSet="/images/nijengee-architecture-900.webp 900w, /images/nijengee-architecture.webp 1800w" sizes="100vw" alt="" fetchPriority="high" decoding="async" className={styles.photo}/>
 <div className={styles.shade}/>
 <div className={styles.topline}><span className={styles.location}><span/> Kinshasa, RDC</span><BrandMark variant="white" width={28} height={25}/></div>
 <div className={styles.copy}><span className={styles.signature}>Votre projet, les bons experts.</span>
 <h1 id="hero-title">Un projet à vous.<br/>Les bons experts<br/>à vos côtés.</h1>
 <p className={styles.description}>Architecture, ingénierie, construction. Rencontrez les professionnels qui donneront vie à votre projet.</p>
 <div className={styles.actions}><Link href="/demande" className={styles.primary}>Trouver mon professionnel <span><BrandIcon name="arrow" width={18} height={18}/></span></Link><Link href="#fonctionnement" className={styles.secondary}>Comment ça marche <span>↗</span></Link></div>
 <div className={styles.assurance}><BrandIcon name="shield" width={19} height={19}/><span>Sans compte. Un accompagnement humain.</span></div>
 </div>
 <div className={styles.bottom}><span>De l’idée au premier contact.</span><span className={styles.caption}>Architecture contemporaine · Inspiration</span></div>
 </section>}
