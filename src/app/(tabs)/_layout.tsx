import { TabList, TabSlot, Tabs, TabTrigger } from 'expo-router/ui';
import { StyleSheet } from 'react-native';

import { AskComposer } from '@/components/agent/ask-composer';
import { ChromeProvider } from '@/components/navigation/chrome';
import { TabBar } from '@/components/navigation/tab-bar';
import { BlurTarget } from '@/components/ui/blur-target';

export default function TabsLayout() {
  return (
    <ChromeProvider>
      <Tabs style={styles.fill}>
        <BlurTarget style={styles.fill}>
          <TabSlot style={styles.fill} />
        </BlurTarget>
        <TabBar />
        <AskComposer />
        <TabList style={styles.hidden}>
          <TabTrigger name="home" href="/home" />
          <TabTrigger name="calendar" href="/calendar" />
          <TabTrigger name="ideas" href="/ideas" />
          <TabTrigger name="you" href="/you" />
        </TabList>
      </Tabs>
    </ChromeProvider>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  hidden: { display: 'none' },
});
