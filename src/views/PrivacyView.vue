<script setup>
</script>

<template>
  <section class="tool">
    <header class="tool-head">
      <h2>Privacy Policy</h2>
      <p>Last updated: October 2026</p>
    </header>

    <div class="legal-content">
      <article class="legal-section highlight">
        <h3>We Do Not Collect Your Data</h3>
        <p>We do not collect, store, or process any personal information from our users. All audio processing happens locally in your browser — your files never leave your device.</p>
      </article>

      <article class="legal-section">
        <h3>Local Processing</h3>
        <p>Our audio tools run entirely in your web browser using JavaScript. When you upload a file, it is processed on your computer, not on our servers. We have no access to your files.</p>
      </article>

      <article class="legal-section">
        <h3>Third-Party Advertising</h3>
        <p>This website displays advertisements from Google Ads and other third-party advertising networks. These advertising partners may collect and use certain information about your visits to this and other websites to provide relevant advertisements.</p>
        <p>Third-party advertisers may use:</p>
        <ul>
          <li>Cookies and similar tracking technologies</li>
          <li>Device identifiers</li>
          <li>Browsing history across websites</li>
          <li>IP address and general location</li>
        </ul>
        <p>This data collection is governed by the respective privacy policies of these advertising partners.</p>
      </article>

      <article class="legal-section">
        <h3>Google Ads</h3>
        <p>Google uses cookies to serve ads based on your prior visits to this website or other websites. You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google Ads Settings</a>.</p>
      </article>

      <article class="legal-section">
        <h3>Your Choices</h3>
        <p>You can control cookies through your browser settings. Most browsers allow you to block or delete cookies. Note that blocking cookies may affect the functionality of advertisements but will not impact the audio tools.</p>
      </article>

      <article class="legal-section">
        <h3>Children's Privacy</h3>
        <p>Our service is not directed to children under 13. We do not knowingly collect any information from children.</p>
      </article>

      <article class="legal-section">
        <h3>Changes to This Policy</h3>
        <p>We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date.</p>
      </article>

      <article class="legal-section">
        <h3>Contact</h3>
        <p>If you have questions about this privacy policy, please contact us through our website.</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.legal-content {
  display: grid;
  gap: 1rem;
}

.legal-section {
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: 0.7rem;
  background: var(--key);
}

.legal-section.highlight {
  border-color: var(--ink);
  background: var(--panel);
}

.legal-section h3 {
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
}

.legal-section p {
  margin: 0.4rem 0 0;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.6;
}

.legal-section p:first-of-type {
  margin-top: 0;
}

.legal-section ul {
  margin: 0.5rem 0;
  padding-left: 1.2rem;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.6;
}

.legal-section a {
  color: var(--ink);
}
</style>
