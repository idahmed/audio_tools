<script setup>
import { tools } from '@/tools'

defineProps({
  kind: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="info-content">
    <template v-if="kind === 'docs'">
      <article>
        <h3>Getting started</h3>
        <ol>
          <li>Select a tool from the tabs.</li>
          <li>Drop an audio file or click to browse.</li>
          <li>Adjust settings, then download.</li>
        </ol>
      </article>
      <article>
        <h3>Privacy first</h3>
        <p>All processing stays in your browser. Files are never uploaded to our servers.</p>
      </article>
      <article>
        <h3>Keyboard shortcuts</h3>
        <ul>
          <li><kbd>1</kbd>–<kbd>9</kbd> Tools</li>
          <li><kbd>0</kbd> Channels</li>
          <li><kbd>L</kbd> Loop</li>
          <li><kbd>O</kbd> Open</li>
          <li><kbd>Z</kbd> Undo</li>
          <li><kbd>Esc</kbd> Clear</li>
        </ul>
      </article>
      <article>
        <h3>Available tools</h3>
        <ul>
          <li v-for="tool in tools" :key="tool.path">
            <strong>{{ tool.label }}</strong>
          </li>
        </ul>
      </article>
      <article>
        <h3>Formats</h3>
        <p>Input: MP3, WAV, OGG, M4A, FLAC, and other browser-supported formats.</p>
        <p>Output: MP3, WAV, WebM, OGG, M4A (depends on browser support).</p>
      </article>
    </template>

    <template v-else-if="kind === 'terms'">
      <article>
        <h3>1. Acceptance of Terms</h3>
        <p>By using this website, you accept these Terms of Service.</p>
      </article>
      <article>
        <h3>2. Service Description</h3>
        <p>
          Browser-based audio tools. Processing runs locally. Files are not uploaded
          to our servers.
        </p>
      </article>
      <article>
        <h3>3. User Responsibilities</h3>
        <p>
          You must have the right to process any audio you use. Do not use the
          service for illegal purposes.
        </p>
      </article>
      <article>
        <h3>4. Intellectual Property</h3>
        <p>You retain all rights to your audio files.</p>
      </article>
      <article>
        <h3>5. Disclaimer</h3>
        <p>The service is provided “as is” without warranties of any kind.</p>
      </article>
      <article>
        <h3>6. Limitation of Liability</h3>
        <p>We are not liable for damages arising from use of the service.</p>
      </article>
      <article>
        <h3>7. Third-Party Advertising</h3>
        <p>
          Ads from Google Ads and partners may use cookies to serve relevant ads.
        </p>
      </article>
      <article>
        <h3>8. Contact</h3>
        <p>
          Questions:
          <a href="https://sessea.com" target="_blank" rel="noopener">sessea.com</a>
        </p>
      </article>
      <p class="info-date">Last updated: October 2026</p>
    </template>

    <template v-else-if="kind === 'privacy'">
      <article class="highlight">
        <h3>We do not collect your data</h3>
        <p>
          Audio processing happens locally in your browser. Your files never leave
          your device.
        </p>
      </article>
      <article>
        <h3>Local processing</h3>
        <p>Tools run in JavaScript on your computer. We cannot access your files.</p>
      </article>
      <article>
        <h3>Third-party advertising</h3>
        <p>
          Advertising partners may use cookies and similar tech. Manage ads at
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">
            Google Ads Settings
          </a>.
        </p>
      </article>
      <article>
        <h3>Contact</h3>
        <p>
          Privacy questions:
          <a href="https://sessea.com" target="_blank" rel="noopener">sessea.com</a>
        </p>
      </article>
      <p class="info-date">Last updated: October 2026</p>
    </template>
  </div>
</template>
