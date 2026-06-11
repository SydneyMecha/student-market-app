import { StyleSheet, Dimensions } from 'react-native';

export const C = {
  primary: "#12452f",
  accent: "#EDAA2E",
  surface: "#FCFCFC",
  white: "#FFFFFF",
  black: "#000000",
  charcoal: "#222222",
  lightGray: "#FCFCFC",
  gray: "#7B7B7B",
  bg: "#F8F8F8",
  text: "#222222",
  subtext: "#7B7B7B",
  border: "#E5E9EF",
  navBg: "#FFFFFF",
  navActive: "#12452f",
  heroBg: "#12452f",
  tagBorder: "#7B7B7B",
  badge: "#EDAA2E",
  iconBg: "#F8F9FA",
  textBox: "#F8F9FB",
};

export const globalStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.surface },
  scroll: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 16 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',    
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: C.surface,
    gap: 12,
  },

  headerTitle: { fontSize: 24, fontWeight: '700', color: C.text },

  //Icons
  iconBtn: {
    padding: 4,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: C.iconBg,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  featuredSectionFrame: {
    backgroundColor: C.white,
    borderRadius: 24,
    marginHorizontal: 12,
    paddingVertical: 16,
    marginTop: 12,
    marginBottom: 12,
  },

  // Tag cloud
  tagCloud: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
    marginTop: 24,
    backgroundColor: C.white,
    borderRadius: 24,
    marginHorizontal: 12,
    paddingVertical: 16,
  },
  tagChip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: C.tagBorder,
    backgroundColor: C.surface,
  },
  tagChipActive: { borderColor: C.text },
  tagChipText: { fontSize: 13, color: C.text, fontWeight: "500" },
  tagChipTextActive: { fontWeight: "700" },
});

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const LAYOUT_MATH = {
  windowWidth: SCREEN_WIDTH,
  carouselWidth: SCREEN_WIDTH - 32,
  threeColumnCardWidth: (SCREEN_WIDTH - 32 - 16) / 3,
};