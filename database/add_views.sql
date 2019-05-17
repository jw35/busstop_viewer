DROP VIEW IF EXISTS StopAltZoneArea;

CREATE VIEW StopAltZoneArea AS
SELECT
  S.rowid                         AS rowid,
  S.ATCOCode                      AS AtcoCode,
  S.NaptanCode                    AS NaptanCode,
  S.CommonName                    AS CommonName,
  S.ShortCommonName               AS ShortCommonName,
  S.Landmark                      AS Landmark,
  S.Street                        AS Street,
  S.Crossing                      AS Crossing,
  S.Indicator                     AS Indicator,
  S.Bearing                       AS Bearing,
  S.NptgLocalityCode              AS NptgLocalityCode,
  S.LocalityName                  AS LocalityName,
  S.Town                          AS Town,
  S.Longitude                     AS Longitude,
  S.Latitude                      AS Latitude,
  S.StopType                      AS StopType,
  S.BusStopType                   AS BusStopType,
  S.TimingStatus                  AS TimingStatus,
  S.Notes                         AS Notes,
  S.AdministrativeAreaCode        AS AdministrativeAreaCode,
  S.Status                        AS Status,
  GROUP_CONCAT(P.PlusbusZoneCode, ';') AS PlusbusZoneRef,
  GROUP_CONCAT(SIA.StopAreaCode, ';')  AS StopAreaCode,
  GROUP_CONCAT(A.CommonName, ';') AS AltCommonName,
  GROUP_CONCAT(A.ShortName, ';')  AS AltShortName,
  GROUP_CONCAT(A.Landmark, ';')   AS AltLandmark,
  GROUP_CONCAT(A.Street, ';')     AS AltStreet,
  GROUP_CONCAT(A.Crossing, ';')   AS AltCrossing,
  GROUP_CONCAT(A.Indicator, ';')  AS AltIndicator
FROM 'Stops' AS S
  LEFT JOIN 'StopPlusBusZones' AS P ON S.ATCOCode = P.AtcoCode
  LEFT JOIN 'StopsInArea' AS SIA ON S.ATCOCode = SIA.AtcoCode
  LEFT JOIN 'AlternativeDescriptors' AS A ON S.ATCOCode = A.AtcoCode
GROUP BY
  S.ATCOCode,
  S.NaptanCode,
  S.CommonName,
  S.ShortCommonName,
  S.Landmark,
  S.Street,
  S.Crossing,
  S.Indicator,
  S.Bearing,
  S.NptgLocalityCode,
  S.LocalityName,
  S.Town,
  S.Longitude,
  S.Latitude,
  S.StopType,
  S.BusStopType,
  S.TimingStatus,
  S.Notes,
  S.AdministrativeAreaCode,
  S.Status
ORDER BY S.rowid;


DROP VIEW IF EXISTS StopAreaStop;

CREATE VIEW StopAreaStop AS
SELECT
  SA.rowid                        AS rowid,
  SA.StopAreaCode                 AS StopAreaCode,
  SA.Name                         AS Name,
  SA.AdministrativeAreaCode       AS AdministrativeAreaCode,
  SA.StopAreaType                 AS StopAreaType,
  SA.Status                       AS Status,
  GROUP_CONCAT(SIA.AtcoCode)      AS AtcoCodes
FROM 'StopAreas' AS SA
  LEFT JOIN 'StopsInArea' AS SIA ON SA.StopAreaCode = SIA.StopAreaCode
GROUP BY
  SA.StopAreaCode,
  SA.Name,
  SA.AdministrativeAreaCode,
  SA.StopAreaType,
  SA.Status
ORDER BY SA.rowid;
