<script setup>
import { tools } from '@/tools'
</script>

<template>
  <section class="tool">
    <header class="tool-head">
      <h2>How to Use</h2>
      <p>A quick guide to our browser-based audio tools.</p>
    </header>

    <div class="help-content">
      <article class="help-section">
        <h3>Getting Started</h3>
        <ol>
          <li>Select a tool from the tabs above (Convert, Compress, Trim, etc.)</li>
          <li>Drop your audio file into the drop zone or click to browse</li>
          <li>Adjust settings as needed</li>
          <li>Click Download to save your processed audio</li>
        </ol>
      </article>

      <article class="help-section">
        <h3>Privacy First</h3>
        <p>All processing happens locally in your browser. Your files are never uploaded to any server.</p>
      </article>

      <article class="help-section">
        <h3>Keyboard Shortcuts</h3>
        <ul class="shortcuts">
          <li><kbd>1</kbd>–<kbd>9</kbd> Switch between tools</li>
          <li><kbd>0</kbd> Channels tool</li>
          <li><kbd>L</kbd> Loop tool</li>
          <li><kbd>O</kbd> Open file dialog</li>
          <li><kbd>Z</kbd> Undo last action</li>
          <li><kbd>Esc</kbd> Clear current file</li>
        </ul>
      </article>

      <article class="help-section">
        <h3>Available Tools</h3>
        <ul class="tool-list">
          <li v-for="tool in tools" :key="tool.path">
            <strong>{{ tool.label }}</strong> — {{ tool.title }}
          </li>
        </ul>
      </article>

      <article class="help-section">
        <h3>Batch Processing</h3>
        <p>Drop multiple files at once. Use the queue to switch between them or download all as a ZIP.</p>
      </article>

      <article class="help-section">
        <h3>Supported Formats</h3>
        <p>Input: Most audio formats your browser supports (MP3, WAV, OGG, M4A, FLAC, etc.)</p>
        <p>Output: MP3, WAV, WebM, OGG, M4A (availability depends on browser support)</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.help-content {
  display: grid;
  gap: 1.25rem;
}

.help-section {
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: 0.7rem;
  background: var(--key);
}

.help-section h3 {
  margin: 0 0 0.6rem;
  font-size: 1rem;
}

.help-section p {
  margin: 0.4rem 0 0;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.5;
}

.help-section ol,
.help-section ul {
  margin: 0;
  padding-left: 1.2rem;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.7;
}

.shortcuts {
  list-style: none;
  padding-left: 0;
}

.shortcuts li {
  margin-bottom: 0.3rem;
}

.shortcuts kbd {
  display: inline-block;
  min-width: 1.5rem;
  padding: 0.15rem 0.4rem;
  margin-right: 0.5rem;
  border: 1px solid var(--line);
  border-radius: 0.3rem;
  background: var(--panel);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  text-align: center;
}

.tool-list {
  list-style: none;
  padding-left: 0;
}

.tool-list li {
  margin-bottom: 0.35rem;
}

.tool-list strong {
  color: var(--ink);
}
</style>
