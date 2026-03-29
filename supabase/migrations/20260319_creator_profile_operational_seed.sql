update public.creator_profiles
set
  funnel_metrics = case
    when jsonb_typeof(funnel_metrics) = 'array' and jsonb_array_length(funnel_metrics) > 0 then funnel_metrics
    else '[
      {"id":"funnel-1","label":"Store visits","value":"18.4k","detail":"Total storefront visits in the current 30-day window."},
      {"id":"funnel-2","label":"Offer clicks","value":"4.1k","detail":"Buyers who opened a listing, bundle, or booking page."},
      {"id":"funnel-3","label":"Buyer actions","value":"612","detail":"Adds to cart, bookings started, enrollments started, and inquiry opens."},
      {"id":"funnel-4","label":"Converted orders","value":"84","detail":"Completed sales, bookings, enrollments, and paid project starts."}
    ]'::jsonb
  end,
  item_insights = case
    when jsonb_typeof(item_insights) = 'array' and jsonb_array_length(item_insights) > 0 then item_insights
    else '[
      {"offeringId":"offer-1","title":"Buffalo Sky Ceremony","pillar":"digital-arts","views":3240,"saves":148,"conversions":11,"revenueLabel":"320 INDI"},
      {"offeringId":"offer-3","title":"Night Loom Masterclass","pillar":"courses","views":2890,"saves":201,"conversions":34,"revenueLabel":"$3,026"},
      {"offeringId":"offer-2","title":"Ancestor Pulse Mask","pillar":"physical-items","views":1182,"saves":76,"conversions":2,"revenueLabel":"$2,400"},
      {"offeringId":"offer-4","title":"Color Story Advisory","pillar":"freelancing","views":964,"saves":42,"conversions":6,"revenueLabel":"$900"}
    ]'::jsonb
  end,
  campaign_insights = case
    when jsonb_typeof(campaign_insights) = 'array' and jsonb_array_length(campaign_insights) > 0 then campaign_insights
    else '[
      {"campaignId":"camp-1","placementLabel":"Homepage Artist Spotlight","status":"live","impressions":12400,"clicks":482,"ctrLabel":"3.9%","spendLabel":"$400"},
      {"campaignId":"camp-2","placementLabel":"Digital Arts Hero Placement","status":"completed","impressions":9800,"clicks":361,"ctrLabel":"3.7%","spendLabel":"$200"},
      {"campaignId":"camp-3","placementLabel":"Trending Collection Takeover","status":"scheduled","impressions":0,"clicks":0,"ctrLabel":"Starts Monday","spendLabel":"$300"}
    ]'::jsonb
  end,
  payout_methods = case
    when jsonb_typeof(payout_methods) = 'array' and jsonb_array_length(payout_methods) > 0 then payout_methods
    else '[
      {"id":"bank-us","label":"Bank account","detail":"US settlement in 2-3 business days.","status":"active"},
      {"id":"paypal","label":"PayPal","detail":"Instant payout path for smaller withdrawals.","status":"active"},
      {"id":"mobile-money","label":"Mobile money","detail":"Regional wallet setup for faster local access.","status":"pending"},
      {"id":"indi-token","label":"INDI token","detail":"On-chain withdrawal lane with reduced transfer fees.","status":"active"}
    ]'::jsonb
  end,
  transaction_history = case
    when jsonb_typeof(transaction_history) = 'array' and jsonb_array_length(transaction_history) > 0 then transaction_history
    else '[
      {"id":"txn-1","date":"Mar 13","item":"Buffalo Sky Ceremony","amount":"320 INDI","status":"Paid","pillar":"digital-arts","type":"sale"},
      {"id":"txn-2","date":"Mar 12","item":"Night Loom Masterclass","amount":"$89","status":"Settled","pillar":"courses","type":"sale"},
      {"id":"txn-3","date":"Mar 11","item":"Ancestor Pulse Mask","amount":"$1,200","status":"Pending payout","pillar":"physical-items","type":"sale"},
      {"id":"txn-4","date":"Mar 10","item":"Weekly creator payout","amount":"$847","status":"Settled","pillar":"freelancing","type":"payout"}
    ]'::jsonb
  end,
  verification_workflow = case
    when jsonb_typeof(verification_workflow) = 'array' and jsonb_array_length(verification_workflow) > 0 then verification_workflow
    else '[
      {"id":"verify-1","title":"Gold / Elder verification","detail":"Community references and supporting identity documents are ready to submit.","status":"ready","actionLabel":"Submit now"},
      {"id":"verify-2","title":"Sacred content approval","detail":"One restricted archive item needs elder sign-off before public release.","status":"needs-info","actionLabel":"Upload files"},
      {"id":"verify-3","title":"Premium placement readiness","detail":"Ad creative needs compliance review before the next homepage run.","status":"submitted","actionLabel":"Track review"}
    ]'::jsonb
  end,
  help_resources = case
    when jsonb_typeof(help_resources) = 'array' and jsonb_array_length(help_resources) > 0 then help_resources
    else '[
      {"id":"help-1","title":"Voice-first listing guide","detail":"Record the story first, then polish the listing details.","actionLabel":"Play","href":"/creator-hub?tab=help#voice-guide"},
      {"id":"help-2","title":"Royalties explained","detail":"Understand resale royalties and rights settings in plain language.","actionLabel":"Read","href":"/creator-hub?tab=help#royalties"},
      {"id":"help-3","title":"Offline mode","detail":"See how drafts sync after connection returns.","actionLabel":"Learn","href":"/creator-hub?tab=help#offline-mode"}
    ]'::jsonb
  end
where slug = 'aiyana-redbird';
