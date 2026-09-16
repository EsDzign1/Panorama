import React, { useState } from 'react';
import { RoomScene } from '../types';
import {
  X,
  Copy,
  Check,
  Code,
  Share2,
  ExternalLink,
  Laptop,
  Tablet,
  Smartphone,
  Sliders,
  Terminal,
  Eye,
  Github,
  AlertCircle,
} from 'lucide-react';

interface EmbedModalProps {
  rooms: RoomScene[];
  currentRoomId: string;
  onClose: () => void;
}

export const EmbedModal: React.FC<EmbedModalProps> = ({
  rooms,
  currentRoomId,
  onClose,
}) => {
  const [selectedRoom, setSelectedRoom] = useState(currentRoomId);
  const [autoRotate, setAutoRotate] = useState(true);
  const [controlsLevel, setControlsLevel] = useState<'full' | 'minimal' | 'clean'>('minimal');
  const [showHotspots, setShowHotspots] = useState(true);
  const [showFloorPlan, setShowFloorPlan] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'iframe' | 'api' | 'preview' | 'github'>('iframe');

  const [copiedIframe, setCopiedIframe] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedDeployCmd, setCopiedDeployCmd] = useState(false);

  // Generate Embed URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const params = new URLSearchParams();
  params.set('embed', 'true');
  if (selectedRoom) params.set('room', selectedRoom);
  if (!autoRotate) params.set('autorotate', 'false');
  if (controlsLevel !== 'minimal') params.set('controls', controlsLevel);
  if (!showHotspots) params.set('hotspots', 'false');
  if (!showFloorPlan) params.set('floorplan', 'false');

  const embedUrl = `${baseUrl}?${params.toString()}`;
  const iframeSnippet = `<iframe
  src="${embedUrl}"
  width="100%"
  height="600px"
  frameborder="0"
  allow="accelerometer; gyroscope; vr; fullscreen"
  allowfullscreen
  style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);"
></iframe>`;

  const copyToClipboard = (text: string, type: 'iframe' | 'url') => {
    navigator.clipboard.writeText(text);
    if (type === 'iframe') {
      setCopiedIframe(true);
      setTimeout(() => setCopiedIframe(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  return (
    <div
      id="embed-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        id="embed-modal-card"
        className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                360° Embedded Integration Studio
              </h3>
              <p className="text-xs text-neutral-400">
                Embed this interactive 360° tour into any website, client portal, or real estate listing.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-neutral-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('iframe')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'iframe'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            iFrame Embed Code
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'preview'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Live Responsive Sandbox
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'api'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            JavaScript API &amp; Events
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'github'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            GitHub Pages Guide
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Configuration Controls */}
          <div className="p-4 bg-neutral-800/40 rounded-xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                Embed Parameters
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {/* Starting Room */}
              <div>
                <label className="block text-neutral-400 mb-1">Starting Room</label>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* UI Controls Level */}
              <div>
                <label className="block text-neutral-400 mb-1">Controls Theme</label>
                <select
                  value={controlsLevel}
                  onChange={(e) => setControlsLevel(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none"
                >
                  <option value="minimal">Minimal (Floating Pill)</option>
                  <option value="full">Full (Room Carousel + Map)</option>
                  <option value="clean">Clean (Unobtrusive / Viewer Only)</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="flex flex-col justify-center gap-2">
                <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRotate}
                    onChange={(e) => setAutoRotate(e.target.checked)}
                    className="rounded accent-blue-500"
                  />
                  <span>Auto-rotate on load</span>
                </label>

                <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showHotspots}
                    onChange={(e) => setShowHotspots(e.target.checked)}
                    className="rounded accent-blue-500"
                  />
                  <span>Show Hotspots</span>
                </label>

                <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showFloorPlan}
                    onChange={(e) => setShowFloorPlan(e.target.checked)}
                    className="rounded accent-blue-500"
                  />
                  <span>Show Floor Plan Radar</span>
                </label>
              </div>
            </div>
          </div>

          {/* TAB 1: IFRAME SNIPPET */}
          {activeTab === 'iframe' && (
            <div className="space-y-4">
              {/* Iframe Code Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-neutral-300">
                    HTML Embed Code
                  </span>
                  <button
                    onClick={() => copyToClipboard(iframeSnippet, 'iframe')}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors shadow"
                  >
                    {copiedIframe ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedIframe ? 'Copied to Clipboard!' : 'Copy iFrame Code'}
                  </button>
                </div>
                <div className="relative">
                  <pre className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 text-xs font-mono text-neutral-300 overflow-x-auto leading-relaxed">
                    {iframeSnippet}
                  </pre>
                </div>
              </div>

              {/* Direct Share URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-neutral-300">
                    Direct Standalone URL
                  </span>
                  <button
                    onClick={() => copyToClipboard(embedUrl, 'url')}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg font-medium transition-colors"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedUrl ? 'URL Copied!' : 'Copy Link'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={embedUrl}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-400 select-all"
                  />
                  <a
                    href={embedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl transition-colors shrink-0"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE RESPONSIVE PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-3">
              {/* Device Selector */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">
                  Select device viewport to preview embed responsiveness:
                </span>
                <div className="flex items-center gap-1 p-1 bg-neutral-800 rounded-lg">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                      previewDevice === 'desktop' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" /> Desktop (16:9)
                  </button>
                  <button
                    onClick={() => setPreviewDevice('tablet')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                      previewDevice === 'tablet' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Tablet className="w-3.5 h-3.5" /> Tablet (4:3)
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                      previewDevice === 'mobile' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Mobile
                  </button>
                </div>
              </div>

              {/* Embedded Frame Sandbox */}
              <div className="w-full flex items-center justify-center p-4 bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden min-h-[360px]">
                <div
                  className="transition-all duration-300 rounded-xl overflow-hidden shadow-2xl border border-neutral-700 bg-neutral-900"
                  style={{
                    width: previewDevice === 'desktop' ? '100%' : previewDevice === 'tablet' ? '560px' : '320px',
                    height: previewDevice === 'mobile' ? '460px' : '360px',
                  }}
                >
                  <iframe
                    src={embedUrl}
                    title="Live Embed Preview"
                    className="w-full h-full border-none"
                    allow="accelerometer; gyroscope; vr; fullscreen"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: JAVASCRIPT POSTMESSAGE API */}
          {activeTab === 'api' && (
            <div className="space-y-4 text-xs">
              <p className="text-neutral-300">
                You can programmatically control the embedded 360 viewer from your host web app using the standard browser <code className="text-blue-400 font-mono">postMessage</code> API:
              </p>

              <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2 font-mono">
                <span className="text-neutral-400 block">// 1. Navigate to a room from parent site</span>
                <span className="text-emerald-400 block">
                  iframeElement.contentWindow.postMessage&#40;&#123; type: 'COO_NAVIGATE_ROOM', roomId: 'room-kitchen' &#125;, '*'&#41;;
                </span>

                <span className="text-neutral-400 block mt-2">// 2. Toggle Auto-rotation</span>
                <span className="text-emerald-400 block">
                  iframeElement.contentWindow.postMessage&#40;&#123; type: 'COO_TOGGLE_AUTOROTATE' &#125;, '*'&#41;;
                </span>

                <span className="text-neutral-400 block mt-2">// 3. Listen for viewer events (e.g. hotspot clicked)</span>
                <span className="text-sky-300 block">
                  window.addEventListener&#40;'message', &#40;event&#41; =&gt; &#123;<br />
                  &nbsp;&nbsp;if &#40;event.data?.type === 'COO_HOTSPOT_CLICKED'&#41; &#123;<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;console.log&#40;'User clicked product tag:', event.data.hotspot&#41;;<br />
                  &nbsp;&nbsp;&#125;<br />
                  &#125;&#41;;
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: GITHUB PAGES DEPLOYMENT */}
          {activeTab === 'github' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3 text-amber-200">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block text-sm text-amber-300">
                    Fixing "Resource failed to load: /src/main.tsx"
                  </span>
                  <p className="text-neutral-300 leading-relaxed">
                    This error happens when GitHub Pages is serving the raw source code repository instead of the compiled production build from the <code className="text-amber-300 font-mono">dist/</code> folder. Modern browsers cannot run TypeScript <code className="text-amber-300 font-mono">.tsx</code> files directly without compilation.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-white text-sm">How to fix in 1 minute:</h4>

                {/* Option 1 */}
                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-[11px] flex items-center justify-center font-bold">1</span>
                    <span>Method 1: GitHub Actions (Automatic, Recommended)</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-neutral-300 pl-1 leading-relaxed">
                    <li>Push your code to your repository (e.g. <code className="text-blue-400 font-mono">esdzign1/esdzign1.github.io</code>).</li>
                    <li>On GitHub, go to <strong>Settings</strong> &rarr; <strong>Pages</strong>.</li>
                    <li>Under <strong>Build and deployment &gt; Source</strong>, change the dropdown to:
                      <div className="mt-1 p-2 bg-neutral-900 border border-neutral-700 rounded-lg font-mono text-emerald-400 font-bold">
                        GitHub Actions
                      </div>
                    </li>
                    <li>The included workflow (<code className="text-blue-400 font-mono">.github/workflows/deploy.yml</code>) will automatically build Vite and deploy the site!</li>
                  </ol>
                </div>

                {/* Option 2 */}
                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-white">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-[11px] flex items-center justify-center font-bold">2</span>
                      <span>Method 2: One-Click Deploy via Terminal</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('npm run deploy');
                        setCopiedDeployCmd(true);
                        setTimeout(() => setCopiedDeployCmd(false), 2000);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      {copiedDeployCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedDeployCmd ? 'Copied!' : 'Copy Command'}
                    </button>
                  </div>
                  <pre className="p-2.5 bg-neutral-900 rounded-lg text-emerald-400 font-mono text-xs">
                    npm run deploy
                  </pre>
                  <p className="text-neutral-400 text-[11px] leading-relaxed">
                    This automatically runs <code className="text-neutral-300 font-mono">vite build</code> and pushes the bundled files to the <code className="text-neutral-300 font-mono">gh-pages</code> branch. In <strong>Settings &rarr; Pages</strong>, set branch to <code className="text-blue-400 font-mono">gh-pages</code> / <code className="text-blue-400 font-mono">root</code>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-800/30 flex items-center justify-between text-xs text-neutral-400">
          <span>Standard Coohom &amp; WebGL 360 Protocol Compatible</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
