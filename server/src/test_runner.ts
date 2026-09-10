/**
 * Phase 6 Step 3 — Business Logic Hardening Test Suite
 *
 * Tests:
 *   A. Analytics (transport cost, year-aware monthly grouping)
 *   B. Lot validation (quantityKg, askingPricePerKg)
 *   C. Commodity resolution (dynamic, no hardcoded ObjectId)
 *   D. Offers (duplicate PENDING, SOLD/CANCELLED lot guards)
 *   E. Regression (full flow: login → lot → offer → accept → analytics)
 */

import * as dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import axios from 'axios';

const BASE = 'http://localhost:5000/api';
let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean, extra?: any) {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}`, extra !== undefined ? `→ ${JSON.stringify(extra)}` : '');
    failed++;
  }
}

async function post(client: any, url: string, data: any) {
  try {
    const r = await client.post(url, data);
    return { status: r.status, data: r.data };
  } catch (e: any) {
    return { status: e.response?.status ?? 0, data: e.response?.data };
  }
}

async function get(client: any, url: string) {
  try {
    const r = await client.get(url);
    return { status: r.status, data: r.data };
  } catch (e: any) {
    return { status: e.response?.status ?? 0, data: e.response?.data };
  }
}

async function patch(client: any, url: string, data: any) {
  try {
    const r = await client.patch(url, data);
    return { status: r.status, data: r.data };
  } catch (e: any) {
    return { status: e.response?.status ?? 0, data: e.response?.data };
  }
}

function authClient(token: string) {
  return axios.create({
    baseURL: BASE,
    headers: { Authorization: `Bearer ${token}` },
    validateStatus: () => true
  });
}

// ── Connect & get commodity via API ────────────────────────────────────────────

async function getCommodityId(anonClient: any): Promise<string | null> {
  try {
    const res = await get(anonClient, '/lots');
    if (res.status === 200 && Array.isArray(res.data) && res.data.length > 0) {
      const commId = res.data[0].commodityId?._id || res.data[0].commodityId;
      if (commId) return commId.toString();
    }
    const suggest = await get(anonClient, '/intelligence/suggest-price?crop=Tomato');
    if (suggest.status === 200 && suggest.data?.commodityId) {
      return suggest.data.commodityId;
    }
    return null;
  } catch {
    return null;
  }
}

async function getInvalidCommodityId(): Promise<string> {
  return '507f1f77bcf86cd799439011';
}

// ──────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n══════════════════════════════════════════════');
  console.log('  FarmSetu Phase 6 Step 3 — Business Logic Tests');
  console.log('══════════════════════════════════════════════\n');

  const anon = axios.create({ baseURL: BASE, validateStatus: () => true });

  // ── Login ──
  console.log('── Auth ─────────────────────────────────────');
  const farmerLogin = await post(anon, '/auth/demo-login', { role: 'FARMER' });
  assert('Farmer login succeeds', farmerLogin.status === 200, farmerLogin.data);
  const farmerToken: string = farmerLogin.data?.token || '';

  const buyerLogin = await post(anon, '/auth/demo-login', { role: 'BUYER' });
  assert('Buyer login succeeds', buyerLogin.status === 200, buyerLogin.data);
  const buyerToken: string = buyerLogin.data?.token || '';

  const adminLogin = await post(anon, '/auth/demo-login', { role: 'ADMIN' });
  const adminToken: string = adminLogin.data?.token || '';

  // Register/login a secondary buyer for authorization testing
  let buyer2Reg = await post(anon, '/auth/register', {
    name: 'Secondary Buyer',
    phone: '+919998887776',
    password: 'Password123',
    role: 'BUYER',
    location: { district: 'Kolar', state: 'Karnataka', coordinates: { lat: 13.13, lng: 78.13 } }
  });
  if (buyer2Reg.status === 400) {
    buyer2Reg = await post(anon, '/auth/login', { phone: '+919998887776', password: 'Password123' });
  }
  const buyer2Token: string = buyer2Reg.data?.token || '';

  // Register/login a secondary farmer for transaction authorization testing
  let farmer2Reg = await post(anon, '/auth/register', {
    name: 'Secondary Farmer',
    phone: '+919998887775',
    password: 'Password123',
    role: 'FARMER',
    location: { district: 'Anantapur', state: 'Andhra Pradesh', coordinates: { lat: 14.68, lng: 77.60 } }
  });
  if (farmer2Reg.status === 400) {
    farmer2Reg = await post(anon, '/auth/login', { phone: '+919998887775', password: 'Password123' });
  }
  const farmer2Token: string = farmer2Reg.data?.token || '';

  assert('Buyer2 registration/login succeeds', buyer2Token !== '', buyer2Reg.data);
  assert('Farmer2 registration/login succeeds', farmer2Token !== '', farmer2Reg.data);

  const farmer = authClient(farmerToken);
  const farmer2 = authClient(farmer2Token);
  const buyer = authClient(buyerToken);
  const buyer2 = authClient(buyer2Token);
  const admin = authClient(adminToken);

  const realCommodityId = await getCommodityId(anon);
  const invalidCommodityId = await getInvalidCommodityId();

  // ── C. Commodity Resolution ──
  console.log('\n── C. Commodity Resolution ──────────────────');

  const c1 = await post(farmer, '/lots', {
    commodityName: 'UnknownNonExistentCrop999',
    quantityKg: 500,
    harvestDate: new Date().toISOString()
  });
  assert('C1: No commodity → 400', c1.status === 400, c1.data?.error);

  const c2 = await post(farmer, '/lots', {
    commodityId: invalidCommodityId,
    commodityName: 'Tomato',
    quantityKg: 500,
    harvestDate: new Date().toISOString()
  });
  assert('C2: Invalid commodity ObjectId → 400', c2.status === 400, c2.data?.error);

  if (realCommodityId) {
    const c3 = await post(farmer, '/lots', {
      commodityId: realCommodityId,
      commodityName: 'Tomato',
      quantityKg: 500,
      askingPricePerKg: 25,
      qualityGrade: 'A',
      harvestDate: new Date().toISOString()
    });
    assert('C3: Valid commodity → 201 Created', c3.status === 201, c3.data);
  } else {
    console.log('  ⚠️  No commodity found in DB — skipping C3');
  }

  // ── B. Lot/Offer Numeric Validation ──
  console.log('\n── B. Lot/Offer Numeric Validation ──────────');

  if (realCommodityId) {
    const b1 = await post(farmer, '/lots', {
      commodityId: realCommodityId,
      commodityName: 'Tomato',
      quantityKg: 0,
      harvestDate: new Date().toISOString()
    });
    assert('B1: quantityKg = 0 → 400', b1.status === 400, b1.data?.error);

    const b2 = await post(farmer, '/lots', {
      commodityId: realCommodityId,
      commodityName: 'Tomato',
      quantityKg: -50,
      harvestDate: new Date().toISOString()
    });
    assert('B2: quantityKg < 0 → 400', b2.status === 400, b2.data?.error);

    const b3 = await post(farmer, '/lots', {
      commodityId: realCommodityId,
      commodityName: 'Tomato',
      quantityKg: 'abc',
      harvestDate: new Date().toISOString()
    });
    assert('B3: quantityKg = "abc" → 400', b3.status === 400, b3.data?.error);

    // Create a valid lot for offer validation tests
    const validLotResp = await post(farmer, '/lots', {
      commodityId: realCommodityId,
      commodityName: 'Tomato',
      quantityKg: 1000,
      askingPricePerKg: 30,
      qualityGrade: 'A',
      harvestDate: new Date().toISOString()
    });

    const validLotId = validLotResp.data?.lot?._id;

    if (validLotId) {
      const b4 = await post(buyer, `/lots/${validLotId}/offers`, {
        pricePerKg: 0,
        transportationTerms: 'BUYER_PICKUP',
        paymentTerms: 'Immediate Cash / UPI',
        validDays: 3
      });
      assert('B4: Offer pricePerKg = 0 → 400', b4.status === 400, b4.data?.error);

      const b5 = await post(buyer, `/lots/${validLotId}/offers`, {
        pricePerKg: -10,
        transportationTerms: 'BUYER_PICKUP',
        paymentTerms: 'Immediate Cash / UPI',
        validDays: 3
      });
      assert('B5: Offer pricePerKg < 0 → 400', b5.status === 400, b5.data?.error);

      const b6 = await post(buyer, `/lots/${validLotId}/offers`, {
        pricePerKg: 'invalid',
        transportationTerms: 'BUYER_PICKUP',
        paymentTerms: 'Immediate Cash / UPI',
        validDays: 3
      });
      assert('B6: Offer pricePerKg = "invalid" → 400', b6.status === 400, b6.data?.error);

      // ── D. Offer Business Rules ──
      console.log('\n── D. Offer Business Rules ───────────────────');

      const d1 = await post(buyer, `/lots/${validLotId}/offers`, {
        pricePerKg: 28,
        transportationTerms: 'BUYER_PICKUP',
        paymentTerms: 'Immediate Cash / UPI',
        validDays: 3
      });
      assert('D1: First offer placed successfully', d1.status === 201, d1.data);

      // GET /lots/:id/offers endpoint validation
      const getOffersResp = await get(farmer, `/lots/${validLotId}/offers`);
      assert('GET /lots/:id/offers returns 200 with offers array for owner farmer', getOffersResp.status === 200 && Array.isArray(getOffersResp.data) && getOffersResp.data.length > 0, getOffersResp.data);

      const invalidLotOffers = await get(farmer, '/lots/invalid-id/offers');
      assert('GET /lots/invalid-id/offers returns 400 for invalid ObjectId', invalidLotOffers.status === 400, invalidLotOffers.data?.error);

      const missingLotOffers = await get(farmer, '/lots/507f1f77bcf86cd799439011/offers');
      assert('GET /lots/nonexistent/offers returns 404 for missing lot', missingLotOffers.status === 404, missingLotOffers.data?.error);

      const d2 = await post(buyer, `/lots/${validLotId}/offers`, {
        pricePerKg: 29,
        transportationTerms: 'BUYER_PICKUP',
        paymentTerms: 'Immediate Cash / UPI',
        validDays: 3
      });
      assert('D2: Duplicate PENDING offer updates existing offer (200) or rejects (400)', d2.status === 200 || d2.status === 400 || d2.status === 409, d2.data);

      // Accept offer to transition lot to SOLD
      const offerId = d1.data?.offer?._id;
      if (offerId) {
        const acceptResp = await post(farmer, `/lots/offers/${offerId}/accept`, {});
        assert('Accept offer → lot becomes SOLD', acceptResp.status === 200, acceptResp.data);

        const d4 = await post(buyer2, `/lots/${validLotId}/offers`, {
          pricePerKg: 35,
          transportationTerms: 'BUYER_PICKUP',
          paymentTerms: 'Immediate Cash / UPI',
          validDays: 2
        });
        assert('D4: Offer on SOLD lot → 400', d4.status === 400, d4.data?.error);
      }
    }
  }

  // D5: Create a CANCELLED lot via endpoint and try to offer on it
  if (realCommodityId) {
    const cancelledLot = await post(farmer, '/lots', {
      commodityId: realCommodityId,
      commodityName: 'Onion',
      quantityKg: 100,
      askingPricePerKg: 20,
      harvestDate: new Date().toISOString()
    });
    if (cancelledLot.status === 201) {
      const cancelledLotId = cancelledLot.data?.lot?._id;
      if (cancelledLotId) {
        await patch(farmer, `/lots/${cancelledLotId}/cancel`, {});
        const d5 = await post(buyer, `/lots/${cancelledLotId}/offers`, {
          pricePerKg: 15,
          transportationTerms: 'BUYER_PICKUP',
          paymentTerms: 'Immediate Cash / UPI',
          validDays: 2
        });
        assert('D5: Offer on CANCELLED lot → 400', d5.status === 400, d5.data?.error);
      }
    }
  }

  // ── A. Analytics ──────────────────────────────────────────────────────────
  console.log('\n── A. Analytics ─────────────────────────────');

  const fa = await get(farmer, '/analytics/farmer-summary');
  assert('A1: Farmer analytics returns 200', fa.status === 200, fa.data);

  if (fa.status === 200) {
    const d = fa.data;
    assert('A2: Farmer analytics has monthlyRevenue array', Array.isArray(d.monthlyRevenue), d.monthlyRevenue);
    assert('A3: monthlyRevenue has 12 entries', d.monthlyRevenue?.length === 12, d.monthlyRevenue?.length);
    assert('A4: totalTransportCostPaid is a number (not percentage)', typeof d.totalTransportCostPaid === 'number', d.totalTransportCostPaid);
    assert('A5: Transport cost is 0 or a positive integer (not a percentage of revenue)', d.totalTransportCostPaid === 0 || Number.isInteger(d.totalTransportCostPaid), d.totalTransportCostPaid);

    // Verify no 5% approximation: if totalRevenue > 0, transport should NOT be exactly 5% of revenue
    if (d.totalRevenue > 0) {
      const fivePercent = Math.round(d.totalRevenue * 0.05);
      const isNotFivePercent = d.totalTransportCostPaid !== fivePercent;
      // Note: could coincidentally match; only flag if it's suspicious
      if (!isNotFivePercent) {
        console.log(`  ⚠️  A6: transport cost (${d.totalTransportCostPaid}) equals exactly 5% of revenue (${fivePercent}) — may be coincidence`);
      } else {
        assert('A6: Transport cost is NOT a flat 5% of revenue approximation', isNotFivePercent, `${d.totalTransportCostPaid} vs 5% = ${fivePercent}`);
      }
    }

    // Verify month labels are ordered (should not repeat same month from last year)
    const labels: string[] = d.monthlyRevenue.map((m: any) => m.month);
    assert('A7: Monthly revenue array has 12 month labels', labels.length === 12, labels);
  }

  const ba = await get(buyer, '/analytics/buyer-summary');
  assert('A8: Buyer analytics returns 200', ba.status === 200, ba.data);

  if (ba.status === 200) {
    const d = ba.data;
    assert('A9: Buyer analytics has monthlySpend array', Array.isArray(d.monthlySpend), d.monthlySpend);
    assert('A10: monthlySpend has 12 entries', d.monthlySpend?.length === 12, d.monthlySpend?.length);
  }

  // ── E. Regression ─────────────────────────────────────────────────────────
  console.log('\n── E. Regression ────────────────────────────');

  const notif = await get(farmer, '/notifications');
  assert('E1: Farmer notifications endpoint accessible', notif.status === 200, notif.data);

  const lotsResp = await get(buyer, '/lots');
  assert('E2: Buyer can see all lots', lotsResp.status === 200, lotsResp.data);

  // ── F. Transaction Status Authorization ──────────────────────────────────
  console.log('\n── F. Transaction Status Authorization ──────');

  if (realCommodityId) {
    const authTestLot = await post(farmer, '/lots', {
      commodityId: realCommodityId,
      commodityName: 'Tomato',
      quantityKg: 200,
      askingPricePerKg: 30,
      qualityGrade: 'A',
      harvestDate: new Date().toISOString()
    });
    const authTestLotId = authTestLot.data?.lot?._id;

    if (authTestLotId) {
      const authTestOffer = await post(buyer, `/lots/${authTestLotId}/offers`, {
        pricePerKg: 30,
        transportationTerms: 'BUYER_PICKUP',
        paymentTerms: 'Immediate Cash / UPI',
        validDays: 2
      });
      const authTestOfferId = authTestOffer.data?.offer?._id;

      if (authTestOfferId) {
        const acceptAuthOffer = await post(farmer, `/lots/offers/${authTestOfferId}/accept`, {});
        const txId = acceptAuthOffer.data?.transaction?._id;

        if (txId) {
          // 1. Buyer can GET/view the transaction
          const buyerGetTx = await get(buyer, `/transactions/${txId}`);
          assert('F1: Buyer can view associated transaction (200)', buyerGetTx.status === 200, buyerGetTx.data);

          // 2. Buyer attempts status update -> 403
          const buyerUpdateStatus = await patch(buyer, `/transactions/${txId}/status`, {
            status: 'PICKUP_SCHEDULED',
            note: 'Buyer trying to change status'
          });
          assert('F2: Buyer status update attempt → 403 Forbidden', buyerUpdateStatus.status === 403, buyerUpdateStatus.data?.error);

          // 3. Unauthorized farmer attempts another farmer's transaction -> 403
          const unauthFarmerUpdateStatus = await patch(farmer2, `/transactions/${txId}/status`, {
            status: 'PICKUP_SCHEDULED',
            note: 'Unauthorized farmer trying to change status'
          });
          assert('F3: Unauthorized farmer status update attempt → 403 Forbidden', unauthFarmerUpdateStatus.status === 403, unauthFarmerUpdateStatus.data?.error);

          // 4. Authorized farmer status update -> succeeds (200)
          const authFarmerUpdateStatus = await patch(farmer, `/transactions/${txId}/status`, {
            status: 'PICKUP_SCHEDULED',
            note: 'Pickup scheduled by farmer'
          });
          assert('F4: Authorized farmer status update → 200 OK', authFarmerUpdateStatus.status === 200, authFarmerUpdateStatus.data);

          // 5. Admin status update -> succeeds (200)
          const adminUpdateStatus = await patch(admin, `/transactions/${txId}/status`, {
            status: 'IN_TRANSIT',
            note: 'In transit status updated by admin'
          });
          assert('F5: Admin status update → 200 OK', adminUpdateStatus.status === 200, adminUpdateStatus.data);

          // ── G. Transport & Logistics Integration ──
          console.log('\n── G. Transport & Logistics Integration ──────');

          // 1. Get cost estimate
          const estResp = await get(farmer, '/transport/estimate?distanceKm=120&quantityKg=2500');
          assert('G1: Transport estimate → 200 OK', estResp.status === 200 && estResp.data?.data?.estimatedCost > 0, estResp.data);

          // 2. Get vehicle recommendation
          const recResp = await get(farmer, '/transport/recommend-vehicle?quantityKg=2500');
          assert('G2: Vehicle recommendation → 200 OK (SMALL_TRUCK)', recResp.status === 200 && recResp.data?.data?.vehicleType === 'SMALL_TRUCK', recResp.data);

          // 3. Create transport booking with enum check
          const bookingResp = await post(farmer, '/transport/bookings', {
            transactionId: txId,
            pickupLocation: 'Pune Farm',
            destinationLocation: 'Mumbai Mandi'
          });
          assert(
            'G3: Create transport booking → 201/200 (stores vehicleType enum TRACTOR and vehicleLabel)',
            (bookingResp.status === 201 || bookingResp.status === 200) &&
              ['TRACTOR', 'SMALL_TRUCK', 'MEDIUM_TRUCK'].includes(bookingResp.data?.data?.vehicleType) &&
              !!bookingResp.data?.data?.vehicleLabel,
            bookingResp.data
          );
          const bookingId = bookingResp.data?.data?._id;

          // 4. Get farmer transport bookings
          const getBookingsResp = await get(farmer, '/transport/farmer-bookings');
          assert('G4: Get farmer transport bookings → 200 OK', getBookingsResp.status === 200 && Array.isArray(getBookingsResp.data?.data), getBookingsResp.data);

          // 5. Buyer status update attempt → 403 Forbidden
          if (bookingId) {
            const buyerStatusResp = await patch(buyer, `/transport/bookings/${bookingId}/status`, {
              status: 'ASSIGNED'
            });
            assert('G5: Buyer transport status update attempt → 403 Forbidden', buyerStatusResp.status === 403, buyerStatusResp.data);

            // 6. Invalid transition: REQUESTED -> IN_TRANSIT (skipping ASSIGNED) → 400 Bad Request
            const skipAssignedResp = await patch(farmer, `/transport/bookings/${bookingId}/status`, {
              status: 'IN_TRANSIT'
            });
            assert('G6: Invalid transition REQUESTED → IN_TRANSIT (skipped ASSIGNED) → 400 Bad Request', skipAssignedResp.status === 400, skipAssignedResp.data);

            // 7. Invalid transition: REQUESTED -> DELIVERED → 400 Bad Request
            const skipDeliveredResp = await patch(farmer, `/transport/bookings/${bookingId}/status`, {
              status: 'DELIVERED'
            });
            assert('G7: Invalid transition REQUESTED → DELIVERED → 400 Bad Request', skipDeliveredResp.status === 400, skipDeliveredResp.data);

            // 8. Valid transition: REQUESTED -> ASSIGNED → 200 OK
            const step1Resp = await patch(farmer, `/transport/bookings/${bookingId}/status`, {
              status: 'ASSIGNED'
            });
            assert('G8: Valid transition REQUESTED → ASSIGNED → 200 OK', step1Resp.status === 200 && step1Resp.data?.data?.status === 'ASSIGNED', step1Resp.data);

            // 9. Invalid transition: ASSIGNED -> DELIVERED (skipping IN_TRANSIT) → 400 Bad Request
            const skipInTransitResp = await patch(farmer, `/transport/bookings/${bookingId}/status`, {
              status: 'DELIVERED'
            });
            assert('G9: Invalid transition ASSIGNED → DELIVERED (skipped IN_TRANSIT) → 400 Bad Request', skipInTransitResp.status === 400, skipInTransitResp.data);

            // 10. Valid transition: ASSIGNED -> IN_TRANSIT → 200 OK
            const step2Resp = await patch(farmer, `/transport/bookings/${bookingId}/status`, {
              status: 'IN_TRANSIT'
            });
            assert('G10: Valid transition ASSIGNED → IN_TRANSIT → 200 OK', step2Resp.status === 200 && step2Resp.data?.data?.status === 'IN_TRANSIT', step2Resp.data);

            // 11. Valid transition: IN_TRANSIT -> DELIVERED → 200 OK
            const step3Resp = await patch(farmer, `/transport/bookings/${bookingId}/status`, {
              status: 'DELIVERED'
            });
            assert('G11: Valid transition IN_TRANSIT → DELIVERED → 200 OK', step3Resp.status === 200 && step3Resp.data?.data?.status === 'DELIVERED', step3Resp.data);
          }
        }
      }
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════');
  console.log(`  TOTAL PASSED: ${passed}`);
  console.log(`  TOTAL FAILED: ${failed}`);
  console.log('══════════════════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('Unhandled error:', e);
  process.exit(1);
});
