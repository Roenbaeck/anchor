var anchor;
while (anchor = schema.nextAnchor()) {
    var knot, attribute;
    while (attribute = anchor.nextHistorizedAttribute()) {
/*~
-- Attribute sheet stack ----------------------------------------------------------------------------------------------
-- ss$attribute.name procedure returning one temporal sheet per positor
-----------------------------------------------------------------------------------------------------------------------
IF Object_ID('$attribute.capsule$.ss$attribute.name', 'P') IS NOT NULL
DROP PROCEDURE [$attribute.capsule].[ss$attribute.name];
GO

CREATE PROCEDURE [$attribute.capsule].[ss$attribute.name] (
    @$anchor.identityColumnName $anchor.identity = null
)
AS
BEGIN
    DECLARE @pivot varchar(max);
    SET @pivot = REPLACE((
        SELECT DISTINCT
            '[' + convert(varchar(23), $attribute.changingColumnName, 126) + ']' AS [text()]
        FROM
            [$attribute.capsule].[$attribute.name]
        WHERE
            $attribute.anchorReferenceName = ISNULL(@$anchor.identityColumnName, $attribute.anchorReferenceName)
        FOR XML PATH('')
    ), '][', '], [');

    DECLARE positor CURSOR FOR
    SELECT DISTINCT
        $attribute.positorColumnName
    FROM
        [$attribute.capsule].[$attribute.name]
    WHERE
        $attribute.anchorReferenceName = ISNULL(@$anchor.identityColumnName, $attribute.anchorReferenceName)
    AND
        $attribute.valueColumnName is not null;

    DECLARE @positor varchar(20);
    OPEN positor;
    FETCH NEXT FROM positor INTO @positor;

    DECLARE @sql varchar(max);

    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @sql = '
            SELECT
                b.$attribute.positorColumnName,
                x.$attribute.anchorReferenceName,
                x.$attribute.positingColumnName,
                b.$attribute.reliableColumnName,
                ' + @pivot + '
            FROM (
                SELECT DISTINCT
                    $attribute.anchorReferenceName,
                    $attribute.positingColumnName
                FROM
                    [$attribute.capsule].[$attribute.name]
                WHERE
                    $attribute.anchorReferenceName = ISNULL(@$anchor.identityColumnName, $attribute.anchorReferenceName)
            ) x
            LEFT JOIN (
                SELECT
                    $attribute.positorColumnName,
                    $attribute.anchorReferenceName,
                    $attribute.positingColumnName,
                    $attribute.reliableColumnName,
                    ' + @pivot + '
                FROM
                    [$attribute.capsule].[$attribute.name]
                PIVOT (
                    MIN($attribute.valueColumnName) FOR $attribute.changingColumnName IN (' + @pivot + ')
                ) p
                WHERE
                    $attribute.anchorReferenceName = ISNULL(@$anchor.identityColumnName, $attribute.anchorReferenceName)
                AND
                    $attribute.positorColumnName = ' + @positor + '
            ) b
            ON
                b.$attribute.anchorReferenceName = x.$attribute.anchorReferenceName
            AND
                b.$attribute.positingColumnName = x.$attribute.positingColumnName
            ORDER BY
                $attribute.anchorReferenceName,
                $attribute.positingColumnName,
                $attribute.reliableColumnName
        ';
        EXEC(@sql);
        FETCH NEXT FROM positor INTO @positor;
    END
    CLOSE positor;
    DEALLOCATE positor;
END
GO
~*/
    }
}

