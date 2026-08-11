import React from 'react';
import { youtubeData } from '@site/static/data/youtube';

export default function YouTubeSection() {
  const videoId = youtubeData?.latestVideoId || 'wm8IB0GcAso';
  const videoTitle = youtubeData?.title || 'Podman Community Meeting';
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  const channelUrl = 'https://www.youtube.com/@Podman';

  return (
    <section className="bg-gray-50/50 py-20 dark:bg-gray-900/40 md:py-28">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-20">
          <div className="max-w-xl lg:flex-[4] flex-1 text-left">
            <span className="dark:text-purple-400 mb-3 block font-display text-sm font-extrabold text-purple-700">Watch on YouTube</span>
            <h2 className="mb-5 mt-1 p-0 font-display text-4xl font-extrabold leading-tight tracking-tight dark:text-white">Podman in Action</h2>
            <div className="text-gray-600 mb-8 space-y-4 text-base leading-relaxed dark:text-gray-300 md:text-lg">
              <p>
                Check out our latest video:{' '}
                <strong className="font-semibold text-purple-700 dark:text-purple-300">{videoTitle}</strong>.
              </p>
              <p className="dark:text-gray-400 text-gray-500">
                See Podman in action! Join our monthly community syncs and live demos to learn directly from the
                maintainers and stay up to date with the ecosystem.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-64 dark:bg-purple-600 hover:bg-purple-800 rounded-lg bg-purple-700 px-6 py-3.5 text-center font-bold text-white no-underline shadow-md transition duration-200 hover:no-underline hover:shadow-lg dark:hover:bg-purple-700">
                Visit YouTube Channel
              </a>
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-64 dark:bg-gray-800 dark:text-gray-200 border-gray-200 rounded-lg border bg-white px-6 py-3.5 text-center font-bold text-gray-700 no-underline shadow-sm transition duration-200 hover:bg-gray-100 hover:no-underline hover:shadow-md dark:border-gray-700 dark:hover:bg-gray-700">
                Watch on YouTube.com
              </a>
            </div>
          </div>

          <div className="w-full max-w-3xl lg:max-w-none lg:flex-[6] flex-1">
            <div className="border-gray-200/80 dark:border-gray-800 group relative aspect-video overflow-hidden rounded-2xl border bg-black shadow-2xl transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_20px_50px_rgba(109,40,217,0.15)] dark:hover:shadow-[0_20px_50px_rgba(168,85,247,0.1)]">
              <iframe
                title={videoTitle}
                src={embedUrl}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
