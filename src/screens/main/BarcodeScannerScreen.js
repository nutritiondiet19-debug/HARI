import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Alert, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { FontSize, FontWeight, BorderRadius, Colors, Shadow } from '../../theme';

import { CameraView, useCameraPermissions } from 'expo-camera';

// Simulated food lookup by barcode
const BARCODE_DB = {
  '012345678901': { name: 'Protein Bar', calories: 200, protein: 20, carbs: 22, fat: 6, servingSize: '60g' },
  '098765432109': { name: 'Greek Yogurt Cup', calories: 100, protein: 17, carbs: 6, fat: 0.7, servingSize: '170g' },
  '111222333444': { name: 'Oat Milk Carton', calories: 120, protein: 3, carbs: 16, fat: 5, servingSize: '240ml' },
};

const BarcodeScannerScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { meal } = route?.params || {};
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [detectedFood, setDetectedFood] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const hasPermission = permission?.granted ?? null;

  // Scanning frame animation
  const scanLineY = useSharedValue(0);
  const cornerOpacity = useSharedValue(1);

  useEffect(() => {
    requestPermission();

    scanLineY.value = withRepeat(
      withSequence(withTiming(200, { duration: 1500 }), withTiming(0, { duration: 1500 })),
      -1,
      false
    );
    cornerOpacity.value = withRepeat(withTiming(0.4, { duration: 800 }), -1, true);
  }, []);

  const scanLineStyle = useAnimatedStyle(() => ({ transform: [{ translateY: scanLineY.value }] }));
  const cornerStyle = useAnimatedStyle(() => ({ opacity: cornerOpacity.value }));

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;
    setScanned(true);
    const food = BARCODE_DB[data];
    if (food) {
      setDetectedFood({ ...food, id: data });
      setModalVisible(true);
    } else {
      Alert.alert('Not Found', `Barcode: ${data}\nFood not found in database.`, [
        { text: 'Try Again', onPress: () => setScanned(false) },
        { text: 'Search Manually', onPress: () => navigation.navigate('FoodSearch', { meal }) },
      ]);
    }
  };

  // Demo scan simulation
  const simulateScan = () => {
    const keys = Object.keys(BARCODE_DB);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    handleBarCodeScanned({ type: 'qr', data: randomKey });
  };

  const handleAddFood = () => {
    setModalVisible(false);
    navigation.navigate('AddMeal', { selectedFood: detectedFood, meal });
  };

  if (hasPermission === false) {
    return (
      <View style={[styles.noCamera, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="dark-content" />
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', top: 56, left: 20 }}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 64, marginBottom: 20 }}>📷</Text>
        <Text style={[styles.noCameraTitle, { color: theme.textPrimary }]}>Camera Not Available</Text>
        <Text style={[styles.noCameraSub, { color: theme.textSecondary }]}>Camera permission denied.</Text>
        <TouchableOpacity style={[styles.demoBtn, { backgroundColor: Colors.primary }]} onPress={simulateScan}>
          <Text style={{ color: '#fff', fontWeight: FontWeight.bold }}>🎯 Demo Scan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {hasPermission && (
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'upc_a', 'upc_e'] }}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Barcode</Text>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="flash-off-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Scanning Frame */}
        <View style={styles.scanFrame}>
          {/* Corners */}
          <Animated.View style={[styles.cornerTL, cornerStyle]} />
          <Animated.View style={[styles.cornerTR, cornerStyle]} />
          <Animated.View style={[styles.cornerBL, cornerStyle]} />
          <Animated.View style={[styles.cornerBR, cornerStyle]} />

          {/* Scan Line */}
          <Animated.View style={[styles.scanLine, scanLineStyle]} />
        </View>

        {/* Bottom hint */}
        <View style={styles.bottomHint}>
          <Text style={styles.hintText}>Point camera at barcode</Text>
          {scanned && (
            <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}>
              <Text style={styles.rescanText}>Tap to scan again</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.demoBtn2} onPress={simulateScan}>
            <Text style={{ color: '#fff', fontWeight: FontWeight.semibold }}>🎯 Demo Scan</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Slide-up Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={{ fontSize: 48 }}>🛒</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalFoodName, { color: theme.textPrimary }]}>{detectedFood?.name}</Text>
                <Text style={[styles.modalServing, { color: theme.textSecondary }]}>{detectedFood?.servingSize}</Text>
              </View>
            </View>

            <View style={styles.modalMacros}>
              {[
                { label: 'Calories', value: detectedFood?.calories, unit: 'kcal', color: Colors.accentOrange },
                { label: 'Protein', value: detectedFood?.protein, unit: 'g', color: Colors.secondary },
                { label: 'Carbs', value: detectedFood?.carbs, unit: 'g', color: Colors.accentOrange },
                { label: 'Fat', value: detectedFood?.fat, unit: 'g', color: Colors.accentPurple },
              ].map(m => (
                <View key={m.label} style={[styles.modalMacro, { backgroundColor: m.color + '15' }]}>
                  <Text style={[styles.modalMacroVal, { color: m.color }]}>{m.value}</Text>
                  <Text style={[styles.modalMacroUnit, { color: theme.textSecondary }]}>{m.unit}</Text>
                  <Text style={[styles.modalMacroLabel, { color: theme.textSecondary }]}>{m.label}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity onPress={handleAddFood} activeOpacity={0.9}>
              <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.addBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="add-circle" size={22} color="#fff" />
                <Text style={styles.addBtnText}>Add to {meal || 'Meal'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setModalVisible(false); setScanned(false); }} style={styles.cancelBtn}>
              <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Scan Another</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const FRAME_SIZE = 240;
const CORNER_SIZE = 24;
const CORNER_WIDTH = 4;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  noCamera: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  noCameraTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, marginBottom: 8 },
  noCameraSub: { fontSize: FontSize.md, textAlign: 'center', marginBottom: 24 },
  demoBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: BorderRadius.full },
  overlay: { flex: 1, justifyContent: 'space-between' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  scanFrame: {
    width: FRAME_SIZE, height: FRAME_SIZE, alignSelf: 'center',
    position: 'relative', overflow: 'hidden',
  },
  cornerTL: { position: 'absolute', top: 0, left: 0, width: CORNER_SIZE, height: CORNER_SIZE, borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderColor: '#22c55e', borderTopLeftRadius: 4 },
  cornerTR: { position: 'absolute', top: 0, right: 0, width: CORNER_SIZE, height: CORNER_SIZE, borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderColor: '#22c55e', borderTopRightRadius: 4 },
  cornerBL: { position: 'absolute', bottom: 0, left: 0, width: CORNER_SIZE, height: CORNER_SIZE, borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderColor: '#22c55e', borderBottomLeftRadius: 4 },
  cornerBR: { position: 'absolute', bottom: 0, right: 0, width: CORNER_SIZE, height: CORNER_SIZE, borderBottomWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderColor: '#22c55e', borderBottomRightRadius: 4 },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: '#22c55e', opacity: 0.8 },
  bottomHint: { alignItems: 'center', paddingBottom: 60, gap: 16, backgroundColor: 'rgba(0,0,0,0.4)', paddingTop: 24 },
  hintText: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.md },
  rescanBtn: { paddingHorizontal: 24, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: BorderRadius.full },
  rescanText: { color: '#fff', fontWeight: FontWeight.semibold },
  demoBtn2: { paddingHorizontal: 24, paddingVertical: 10, backgroundColor: Colors.primary, borderRadius: BorderRadius.full },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 48, gap: 16 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginBottom: 8 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modalFoodName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  modalServing: { fontSize: FontSize.sm, marginTop: 4 },
  modalMacros: { flexDirection: 'row', gap: 8 },
  modalMacro: { flex: 1, alignItems: 'center', padding: 12, borderRadius: BorderRadius.md },
  modalMacroVal: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  modalMacroUnit: { fontSize: 10 },
  modalMacroLabel: { fontSize: 10 },
  addBtn: { borderRadius: BorderRadius.full, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  cancelBtn: { alignItems: 'center', paddingVertical: 4 },
  cancelText: { fontSize: FontSize.md },
});

export default BarcodeScannerScreen;
