import { useState } from 'react';
import { invoke } from '@tauri-apps/api';
import { Tabs, Tag } from 'antd';

import { GITHUB_LOG_URL } from '@/utils';
import useInit from '@/hooks/useInit';
import Markdown from '@/components/Markdown';
import './index.scss';

export default function About() {
  const [logContent, setLogContent] = useState('');

  useInit(async () => {
    const data = (await invoke('get_data', { url: GITHUB_LOG_URL })) || '';
    setLogContent(data as string);
  });

  return (
    <div className="about">
      <Tabs
        items={[
          { label: 'About LangHelper', key: 'langhelper', children: <AboutLangHelper /> },
          { label: 'About ChatGPT', key: 'about', children: <AboutChatGPT /> },
          { label: 'Update Log', key: 'log', children: <LogTab content={logContent} /> },
        ]}
      />
    </div>
  );
}

const AboutLangHelper = () =>{
  return (
    <div className="about-tab">
      <p>
        This is new function for learning languages, you can talk with ChatGPT with natural
        AI sound, get pronuciation assessment, memorize words with context, practice listening,
        so on, its based on ChatGPT Desktop@lencx, I've been developing this language helper on 
        the shoulders of gaints, if it helps you, do not hesitate to star it, any problems
        you can follow my channel
        <a href="https://space.bilibili.com/33672855" target="_blank"> https://space.bilibili.com/33672855 </a>
        to get solutions and update,
        and if you have new ideas for it, please contact my email
        <a> nslearning888@gmail.com</a>
           
      </p>
    </div>
  )
}

const AboutChatGPT = () => {
  return (
    <div className="about-tab">
      <Tag>ChatGPT Desktop Application (Mac, Windows and Linux)</Tag>
      <p>
        🕒 History versions:{' '}
        <a href="https://github.com/lencx/ChatGPT/releases" target="_blank">
          lencx/ChatGPT/releases
        </a>
      </p>
      <p>
        It is just a wrapper for the
        <a href="https://chat.openai.com" target="_blank" title="https://chat.openai.com">
          {' '}
          OpenAI ChatGPT{' '}
        </a>
        website, no other data transfer exists (you can check the{' '}
        <a
          href="https://github.com/lencx/ChatGPT"
          target="_blank"
          title="https://github.com/lencx/ChatGPT"
        >
          {' '}
          source code{' '}
        </a>
        ). The development and maintenance of this software has taken up a lot of my time. If it
        helps you, you can buy me a cup of coffee (Chinese users can use WeChat to scan the code),
        thanks!
      </p>
      <p className="imgs" style={{ float: 'left' }}>
        <a href="https://www.buymeacoffee.com/lencx" target="_blank">
          <img
            src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png"
            alt="Buy Me A Coffee"
          />
        </a>{' '}
        <br />
        <img
          width="200"
          src="https://user-images.githubusercontent.com/16164244/207228025-117b5f77-c5d2-48c2-a070-774b7a1596f2.png"
        />
      </p>
      <img
        width="250"
        src="https://user-images.githubusercontent.com/16164244/219439614-d5c3710c-e0b3-4df9-9b3c-c150ba0ba5f1.png"
      />
    </div>
  );
};

const LogTab = ({ content }: { content: string }) => {
  return (
    <div>
      <p>
        Ref:{' '}
        <a href="https://github.com/lencx/ChatGPT/blob/main/UPDATE_LOG.md" target="_blank">
          lencx/ChatGPT/UPDATE_LOG.md
        </a>
      </p>
      <Markdown className="log-tab" children={content} />
    </div>
  );
};
