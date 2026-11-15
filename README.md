# CoolCorridor

### Environment-aware walking navigation

CoolCorridor is a walking navigation platform that looks beyond the shortest route. It explores how satellite-derived environmental data can inform walking decisions in areas experiencing extreme heat.

By comparing walking routes using environmental indicators, CoolCorridor identifies alternative paths with comparatively lower modelled heat-exposure scores, helping users consider environmental conditions alongside distance and estimated walking time.

---

## Project Resources

The project is organised across three repositories and research resources:

| Component | Description | Link |
|---|---|---|
| Frontend | React, TypeScript and Vite application | [coolcorridor-frontend](https://github.com/rohailhayat146/coolcorridor-frontend) |
| Backend | Python FastAPI routing and processing backend | [coolcorridor](https://github.com/rohailhayat146/coolcorridor) |
| Research & ML | Google Colab notebook for geospatial processing and the preliminary machine-learning experiment | [Open Google Colab](https://colab.research.google.com/drive/1tOExmDBDVnBBkU8cEbfWBXmcihEF4N-C) |

---

## Research & Data

CoolCorridor draws on publicly available environmental and geospatial datasets:

- **USGS Landsat 8 and 9 Collection 2 Level-2:** Satellite imagery used to derive Land Surface Temperature (LST).
- **Normalized Difference Vegetation Index (NDVI):** Derived from Landsat red and near-infrared bands to represent vegetation greenness.
- **ERA5-Land:** Daily mean air-temperature data used in a preliminary machine-learning experiment.
- **OpenStreetMap:** Pedestrian network data used for walking route generation.

The wider environmental analysis covers 176 Landsat scenes across three cities:

- Phoenix, Arizona — 44 scenes
- New Delhi, India — 88 scenes
- Singapore — 44 scenes

The current interactive routing demonstration focuses on Phoenix, Arizona.

## Machine Learning Experiment

A preliminary regression experiment was developed in Python using Google Colab to estimate scene-average Landsat-derived surface temperature from contemporaneous ERA5-Land meteorological information.

On a chronological seven-scene test set:

- Baseline MAE: approximately 17.876
- Regression model MAE: approximately 3.832
- Reduction in MAE against the baseline: approximately 78.6%

This is an initial experimental result, not evidence of pedestrian-level temperature measurement or future street-condition forecasting.

## Application Features

- Interactive walking route planning.
- Comparison of conventional shortest routes with environmentally weighted alternatives.
- Distance and estimated walking-time comparisons.
- Environmental indicators and route summaries.
- User registration and login, alongside guest access.
- Saved route history.
- User feedback, ratings and suggestions.

## Technology Stack

**Frontend**
- React
- TypeScript
- Vite

**Backend**
- Python
- FastAPI

**Data & Infrastructure**
- Supabase Authentication and PostgreSQL
- OpenStreetMap pedestrian network
- Vercel for frontend deployment

## Evaluation

The routing approach was evaluated using 20 origin-destination route pairs in the Phoenix demonstration area.

At the provisional λ2 setting, the results showed:

- Average route detour: approximately 5.92%
- Reduction in modelled route exposure-score proxy: approximately 28.55% compared with reference routes.

These values represent modelled environmental indicators, not directly measured reductions in human heat exposure.

---

## Project Objective

CoolCorridor explores how public environmental datasets, geospatial analysis and machine learning can be brought together in a practical navigation application.

Its broader objective is to make environmental conditions a more meaningful consideration in everyday urban mobility.

## Scope & Future Potential

The current implementation is a focused demonstration using a defined study area in Phoenix. The underlying methodology could potentially be extended to additional cities and larger geographical regions through further satellite-data processing, broader pedestrian-network coverage, regional validation and model recalibration.

---

**Built by Rohail Hayat**
