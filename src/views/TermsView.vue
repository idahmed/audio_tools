<script setup>
</script>

<template>
  <section class="tool">
    <header class="tool-head">
      <h2>Terms of Service</h2>
      <p>Last updated: October 2026</p>
    </header>

    <div class="legal-content">
      <article class="legal-section">
        <h3>1. Acceptance of Terms</h3>
        <p>By accessing and using this website, you accept and agree to be bound by these Terms of Service.</p>
      </article>

      <article class="legal-section">
        <h3>2. Service Description</h3>
        <p>We provide browser-based audio processing tools. All audio processing occurs locally on your device. Files are not uploaded to our servers.</p>
      </article>

      <article class="legal-section">
        <h3>3. User Responsibilities</h3>
        <p>You are responsible for ensuring you have the right to process any audio files you use with our tools. Do not use our service for any illegal purposes.</p>
      </article>

      <article class="legal-section">
        <h3>4. Intellectual Property</h3>
        <p>You retain all rights to your audio files. We do not claim ownership of any content you process using our tools.</p>
      </article>

      <article class="legal-section">
        <h3>5. Disclaimer of Warranties</h3>
        <p>This service is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free operation.</p>
      </article>

      <article class="legal-section">
        <h3>6. Limitation of Liability</h3>
        <p>We shall not be liable for any damages arising from the use or inability to use our service.</p>
      </article>

      <article class="legal-section">
        <h3>7. Third-Party Advertising</h3>
        <p>This site displays advertisements from Google Ads and other third-party advertising partners. These advertisers may use cookies and similar technologies to serve ads based on your browsing activity.</p>
      </article>

      <article class="legal-section">
        <h3>8. Changes to Terms</h3>
        <p>We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of any changes.</p>
      </article>

      <article class="legal-section">
        <h3>9. Contact</h3>
        <p>For questions about these terms, please contact us through our website.</p>
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

.legal-section h3 {
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
}

.legal-section p {
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.6;
}
</style>
