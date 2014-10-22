/*
    Compilation:
    C:\WINDOWS\Microsoft.NET\Framework64\v3.5\csc.exe /optimize /debug- /target:library /out:Anchor.dll Anchor.cs
*/
using System;
using System.Data.SqlTypes;
using Microsoft.SqlServer.Server;
using System.Security.Cryptography;

public partial class Utilities {
    [
        Microsoft.SqlServer.Server.SqlFunction (
            DataAccess=DataAccessKind.None,
            IsDeterministic=true,
            SystemDataAccess=SystemDataAccessKind.None
        )
    ]
    public static SqlBinary HashMD5(SqlBytes binaryData) {
        return binaryData.IsNull ? null : new SqlBinary(MD5.Create().ComputeHash(binaryData.Stream));
    }
}