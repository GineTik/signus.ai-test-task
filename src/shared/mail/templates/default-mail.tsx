import {
  Body,
  Button,
  Head,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import { Html } from '@react-email/html';
import * as React from 'react';

type DefaultMailProps = {
  confirmLink: string;
  title: string;
  description: string;
};

export function DefaultMail({
  confirmLink,
  title,
  description,
}: DefaultMailProps) {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Tailwind>
        <Body className="bg-[#262624] text-[#c3c0b6] p-4">
          <Section className="p-4 border border-[#3e3e38] rounded-xl bg-transparent max-w-[300px] mx-auto w-full border-box">
            <Text className="text-2xl font-bold">{title}</Text>
            <Text className="text-white/50">{description}</Text>
            <Button
              href={confirmLink}
              className="bg-[#d97757] text-[#ffffff] px-4 py-2 rounded-xl font-bold"
            >
              Confirm
            </Button>
          </Section>
        </Body>
      </Tailwind>
    </Html>
  );
}
