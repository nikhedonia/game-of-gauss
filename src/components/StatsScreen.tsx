import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useStatsStore } from '../store/statsStore';
import { useGameStore } from '../store/gameStore';
import { GameStat } from '../types';

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

type DiffGroup = { n: number; m: number; oneoff: GameStat[]; race: GameStat[] };

function groupStats(history: GameStat[]): DiffGroup[] {
  const map = new Map<string, DiffGroup>();
  for (const stat of history) {
    const key = `${stat.n}-${stat.m}`;
    if (!map.has(key)) map.set(key, { n: stat.n, m: stat.m, oneoff: [], race: [] });
    const group = map.get(key)!;
    if (stat.mode === 'oneoff') group.oneoff.push(stat);
    else group.race.push(stat);
  }
  return Array.from(map.values()).sort((a, b) => a.n !== b.n ? a.n - b.n : a.m - b.m);
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={styles.pillValue}>{value}</Text>
    </View>
  );
}

function OneoffSection({ stats }: { stats: GameStat[] }) {
  const bestTime = Math.min(...stats.map((s) => s.elapsedSecs));
  const bestMoves = Math.min(...stats.map((s) => s.totalMoves));
  const avgTime = Math.round(stats.reduce((sum, s) => sum + s.elapsedSecs, 0) / stats.length);
  const peekStats = stats.filter((s) => s.peekMode);
  const bestPeeks = peekStats.length > 0 ? Math.min(...peekStats.map((s) => s.peekCount)) : null;

  return (
    <View style={styles.modeSection}>
      <Text style={styles.modeSectionTitle}>
        One-off · {stats.length} game{stats.length !== 1 ? 's' : ''}
      </Text>
      <View style={styles.pillRow}>
        <StatPill label="Best Time" value={formatTime(bestTime)} />
        <StatPill label="Avg Time" value={formatTime(avgTime)} />
        <StatPill label="Fewest Moves" value={String(bestMoves)} />
        {bestPeeks !== null && <StatPill label="Fewest Peeks" value={String(bestPeeks)} />}
      </View>
    </View>
  );
}

function RaceSection({ stats }: { stats: GameStat[] }) {
  const bestScore = Math.max(...stats.map((s) => s.puzzlesSolved));
  const avgScore = (stats.reduce((sum, s) => sum + s.puzzlesSolved, 0) / stats.length).toFixed(1);

  return (
    <View style={styles.modeSection}>
      <Text style={styles.modeSectionTitle}>
        Race · {stats.length} game{stats.length !== 1 ? 's' : ''}
      </Text>
      <View style={styles.pillRow}>
        <StatPill label="Best Score" value={`${bestScore} 🧩`} />
        <StatPill label="Avg Score" value={`${avgScore} 🧩`} />
      </View>
    </View>
  );
}

function DiffBlock({ group }: { group: DiffGroup }) {
  return (
    <View style={styles.diffBlock}>
      <Text style={styles.diffTitle}>
        {group.n}×{group.n} mod {group.m}
      </Text>
      {group.oneoff.length > 0 && <OneoffSection stats={group.oneoff} />}
      {group.race.length > 0 && <RaceSection stats={group.race} />}
    </View>
  );
}

function RecentRow({ stat }: { stat: GameStat }) {
  const date = new Date(stat.timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  const diff = `${stat.n}×${stat.n} m${stat.m}`;
  const result =
    stat.mode === 'race'
      ? `${stat.puzzlesSolved} puzzles`
      : `${formatTime(stat.elapsedSecs)} · ${stat.totalMoves} moves`;
  const modeLabel = stat.mode === 'race' ? 'Race' : 'Solo';

  return (
    <View style={styles.recentRow}>
      <Text style={styles.recentDate}>{date}</Text>
      <Text style={styles.recentDiff}>{diff}</Text>
      <Text style={styles.recentMode}>
        {modeLabel}
        {stat.peekMode ? ' 👁' : ''}
      </Text>
      <Text style={styles.recentResult}>{result}</Text>
    </View>
  );
}

export default function StatsScreen() {
  const history = useStatsStore((s) => s.history);
  const clearStats = useStatsStore((s) => s.clearStats);
  const backToSetup = useGameStore((s) => s.backToSetup);

  const groups = groupStats(history);
  const recent = [...history].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

  function handleClear() {
    Alert.alert('Clear Stats', 'Are you sure you want to clear all stats?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearStats },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Statistics</Text>

      {groups.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No games recorded yet.</Text>
          <Text style={styles.emptyHint}>Finish a game to see your stats here!</Text>
        </View>
      ) : (
        groups.map((g) => <DiffBlock key={`${g.n}-${g.m}`} group={g} />)
      )}

      {recent.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Games</Text>
          {recent.map((stat) => (
            <RecentRow key={stat.id} stat={stat} />
          ))}
        </View>
      )}

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.backBtn} onPress={backToSetup}>
          <Text style={styles.backBtnText}>← Back to Menu</Text>
        </TouchableOpacity>
        {history.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
            <Text style={styles.clearBtnText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 20,
  },
  emptyBox: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 14,
    color: '#888',
  },
  recentSection: {
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  diffBlock: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  diffTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a3a5c',
    marginBottom: 10,
  },
  modeSection: {
    marginBottom: 8,
  },
  modeSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 80,
  },
  pillLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  pillValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a3a5c',
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 4,
    gap: 8,
  },
  recentDate: {
    fontSize: 12,
    color: '#888',
    width: 44,
  },
  recentDiff: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    width: 56,
  },
  recentMode: {
    fontSize: 12,
    color: '#4a90d9',
    width: 60,
  },
  recentResult: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  backBtn: {
    backgroundColor: '#1a3a5c',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  clearBtn: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  clearBtnText: {
    color: '#e74c3c',
    fontSize: 15,
    fontWeight: '600',
  },
});
