import { useEffect, useId, useMemo, useState } from 'react';
import { type DiagramParamsBase } from '../types';
import { CLIENT_ENV } from '@/env';

export const useSvgDiagramMarkup = ({ lang, path, chart }: DiagramParamsBase) => {
  const id = useId();
  const [svg, setSvg] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const krokiApiUrl = useMemo(() => {
    if (lang === 'mermaid') return '';
    const url = new URL('/api/diagram', CLIENT_ENV().NEXT_PUBLIC_APP_URL);

    if (path === '') {
      throw new Error('path is required');
    }

    url.searchParams.set('lang', lang);
    url.searchParams.set('path', path);

    return url.toString();
  }, [lang, path]);

  useEffect(() => {
    if (krokiApiUrl === '') return;

    const fetchSvg = async () => {
      setIsLoading(true);
      const response = await fetch(krokiApiUrl).then(async (res) => {
        if (!res.ok) throw new Error(`Diagram fetch failed: ${res.status}`);

        return res.text();
      });

      setSvg(response);
      setIsLoading(false);
    };

    fetchSvg().catch(() => {
      console.error('Error while fetching diagram');
      setIsLoading(false);
    });
  }, [krokiApiUrl]);

  useEffect(() => {
    if (lang !== 'mermaid') return;
    if (!chart) return;

    const renderChart = async () => {
      const { default: mermaid } = await import('mermaid');

      try {
        setIsLoading(true);
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          fontFamily: 'inherit',
          themeCSS: 'margin: 1.5rem auto 0;',
          theme: 'default',
        });

        const { svg: mermaidSvg } = await mermaid.render(id, chart.replaceAll('\\n', '\n'));

        setSvg(mermaidSvg);
        setIsLoading(false);
      } catch (error) {
        console.error('Error while rendering mermaid', error);
        setIsLoading(false);
      }
    };

    renderChart().catch(() => {
      console.error('Error while rendering mermaid');
    });
  }, [chart, id]);

  return { svg, isLoading };
};
