import styles from './about.module.css';

export default function AboutPage() {
  return (
    <div className={styles.aboutContainer}>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: 'About TNT MKR',
            description:
              'TNT MKR is a faith-driven company based in Belton, Texas, specializing in custom 3D-printed protective accessories for niche electronic devices.',
            mainEntity: {
              '@type': 'Organization',
              name: 'TNT MKR',
              foundingLocation: {
                '@type': 'Place',
                name: 'Belton, Texas',
              },
              founders: [
                {
                  '@type': 'Person',
                  name: 'Jacob Maddux',
                  jobTitle: 'CEO & Lead Designer',
                },
                {
                  '@type': 'Person',
                  name: 'Enoch Munson',
                  jobTitle: 'CFO & Financial Advisor',
                },
              ],
              numberOfEmployees: {
                '@type': 'QuantitativeValue',
                value: 3,
              },
              knowsAbout: [
                '3D printing',
                'custom phone cases',
                'Light Phone III accessories',
                'PLA materials',
                'TPU materials',
              ],
            },
          }),
        }}
      />

      {/* ─── Hero Section ─── */}
      <section className={styles.hero}>
        <h1 className={styles.heroHeadline}>
          Handcrafted in Texas. Driven by Faith. Built to Protect.
        </h1>
        <p className={styles.heroSubtext}>
          TNT MKR is a small, faith-driven company in Belton, Texas, designing and manufacturing
          custom 3D-printed protective accessories for niche electronic devices. Every case we
          create is made with intention, crafted with quality materials, and backed by values that
          put people first.
        </p>
      </section>

      {/* ─── Our Story ─── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Our Story</h2>
        <hr className={styles.divider} />
        <div className={styles.card}>
          <p className={styles.cardText}>
            TNT MKR was born out of a simple idea: that everyday accessories should be made with
            the same care and conviction that goes into the things that matter most. Founded by
            Jacob Maddux and Enoch Munson in Belton, Texas, our company started when we noticed
            a gap in the market for high-quality, customizable cases for niche devices like the
            Light Phone III. We saw an opportunity to do something different — to build a business
            rooted in Christian faith, where integrity is not a slogan but a daily practice.
          </p>
          <p className={styles.cardText}>
            As a small team of three, we handle every step of the process ourselves — from
            designing each case in-house to printing it on our own 3D printers using premium PLA
            and TPU materials. That hands-on approach means every product that leaves our workshop
            has been personally inspected and built to our standards. We are proudly made in the
            USA, and we plan to keep it that way.
          </p>
          <p className={styles.cardText}>
            Beyond business, we believe in giving back. A portion of every sale goes toward
            supporting ministries and charitable initiatives that make a real difference in our
            community and beyond. When you purchase from TNT MKR, you are not just getting a
            protective case — you are joining a mission.
          </p>
        </div>
      </section>

      {/* ─── Our Values ─── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Our Values</h2>
        <hr className={styles.divider} />
        <div className={styles.valuesGrid}>
          <article className={styles.valueCard}>
            <span className={styles.valueIcon} role="img" aria-label="Cross representing faith">
              &#10013;
            </span>
            <h3 className={styles.valueTitle}>Faith</h3>
            <p className={styles.valueDescription}>
              Our Christian faith is the foundation of everything we do. We operate with integrity,
              compassion, and a servant&rsquo;s heart. We believe that how you run a business matters
              just as much as what you sell, and we strive to honor God in every decision we make.
            </p>
          </article>

          <article className={styles.valueCard}>
            <span className={styles.valueIcon} role="img" aria-label="Star representing quality">
              &#9733;
            </span>
            <h3 className={styles.valueTitle}>Quality</h3>
            <p className={styles.valueDescription}>
              We refuse to cut corners. Every case is 3D-printed with high-quality PLA and TPU
              right here in Texas. We carefully select materials for durability and finish, and
              each product is inspected before it ships. Our customers deserve the best, and that
              is exactly what we aim to deliver.
            </p>
          </article>

          <article className={styles.valueCard}>
            <span className={styles.valueIcon} role="img" aria-label="Hands representing community">
              &#9825;
            </span>
            <h3 className={styles.valueTitle}>Community</h3>
            <p className={styles.valueDescription}>
              TNT MKR exists to serve others. A portion of our profits supports ministries and
              charitable causes. We are committed to creating local jobs in Texas, providing
              educational opportunities for young adults, and building relationships with the
              communities we serve.
            </p>
          </article>
        </div>
      </section>

      {/* ─── The Team ─── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>The Team</h2>
        <hr className={styles.divider} />
        <div className={styles.teamGrid}>
          <article className={styles.teamCard}>
            <h3 className={styles.teamName}>Jacob Maddux</h3>
            <p className={styles.teamRole}>CEO &amp; Lead Designer</p>
            <p className={styles.teamBio}>
              Jacob is the creative force behind TNT MKR. As CEO and Lead Designer, he oversees
              product development from initial concept to final print. With a passion for
              precision engineering and an eye for design, Jacob ensures that every case is both
              functional and visually striking. His vision for the company extends beyond
              products — he is driven to build a brand that reflects excellence and faith in
              equal measure.
            </p>
          </article>

          <article className={styles.teamCard}>
            <h3 className={styles.teamName}>Enoch Munson</h3>
            <p className={styles.teamRole}>CFO &amp; Financial Advisor</p>
            <p className={styles.teamBio}>
              Enoch brings financial discipline and strategic foresight to TNT MKR. As CFO and
              Financial Advisor, he manages the business operations that keep the company
              growing sustainably. Enoch is instrumental in ensuring that TNT MKR remains
              financially healthy while staying true to its mission of giving back. His steady
              guidance helps the team make decisions that are both smart and principled.
            </p>
          </article>
        </div>
      </section>

      {/* ─── Looking Ahead ─── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Looking Ahead</h2>
        <hr className={styles.divider} />
        <div className={styles.card}>
          <p className={styles.cardText}>
            We are just getting started. TNT MKR has ambitious plans to grow while staying true
            to the values that define us. Here is what is on the horizon:
          </p>
          <ul className={styles.futureList}>
            <li className={styles.futureItem}>
              <strong>Expanding into new markets</strong> — While we currently focus on the Light
              Phone III, we are actively developing protective accessories for a wider range of
              niche electronic devices. Our goal is to become the go-to source for custom cases
              that mainstream manufacturers overlook.
            </li>
            <li className={styles.futureItem}>
              <strong>Prototyping and design services</strong> — We plan to offer custom
              prototyping and product design services, leveraging our 3D printing expertise to
              help individuals and businesses bring their ideas to life.
            </li>
            <li className={styles.futureItem}>
              <strong>Educational experiences for young adults</strong> — From middle school
              through college, we want to open our doors and our knowledge to the next
              generation. We envision workshops, internships, and hands-on learning opportunities
              that introduce young people to 3D printing, design, and entrepreneurship.
            </li>
            <li className={styles.futureItem}>
              <strong>Creating local jobs in Texas</strong> — As we grow, so does our commitment
              to our home state. We plan to hire locally and invest in the Belton community,
              building a team that shares our values and our work ethic.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
