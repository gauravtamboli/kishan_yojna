        [HttpPost]
        [Route("officersDashboardData")]
        public async Task<IActionResult> getOfficersDashboardData([FromBody] GetOfficersDashboardReqestModel getOfficersDashboardReqestModel)
        {

            Dictionary<string, object> finalArrayToReturn = new Dictionary<string, object>();
            SqlConnection cone = new SqlConnection(_iConfiguration.GetConnectionString("KisaanMitraDbCon").ToString());

            var conditionForQuery = "";

            // SUPER ADMIN //
            if (getOfficersDashboardReqestModel.designation_id == 6)
            {
                conditionForQuery = " where 1 = 1 ";
            }

            // CFO //
            else if (getOfficersDashboardReqestModel.designation_id == 1)
            {
                conditionForQuery = "where circle_id = '" + getOfficersDashboardReqestModel.circle_id + "' ";
            }
            // DFO //
            else if (getOfficersDashboardReqestModel.designation_id == 2)
            {
                conditionForQuery = "where circle_id = '" + getOfficersDashboardReqestModel.circle_id + "' and division_id = '" + getOfficersDashboardReqestModel.devision_id + "' ";
            }
            //SDO
            else if (getOfficersDashboardReqestModel.designation_id == 3)
            {  
                SqlCommand getSubDivCmd = new SqlCommand("SELECT sub_div_id FROM login_details WHERE id = @officerId", cone);
    getSubDivCmd.Parameters.AddWithValue("@officerId", getOfficersDashboardReqestModel.officers_id);
    
    cone.Open();
    var subDivId = getSubDivCmd.ExecuteScalar()?.ToString();
    cone.Close();
    
    if (!string.IsNullOrEmpty(subDivId))
    {
        // Then, get all rang_id values for that sub_div_id
        SqlCommand getRangIdsCmd = new SqlCommand("SELECT DISTINCT rang_id FROM login_details WHERE sub_div_id = @subDivId AND rang_id IS NOT NULL", cone);
        getRangIdsCmd.Parameters.AddWithValue("@subDivId", subDivId);
        
        cone.Open();
        SqlDataReader reader = getRangIdsCmd.ExecuteReader();
        List<string> rangIds = new List<string>();
        
        while (reader.Read())
          {
            rangIds.Add(reader["rang_id"].ToString());
        }
        reader.Close();
        cone.Close();
        
        // Build the condition with IN clause
        if (rangIds.Count > 0)
        {
            string rangIdList = string.Join("','", rangIds);
            conditionForQuery = $"WHERE rang_id IN ('{rangIdList}')";
        }
        else
        {
            conditionForQuery = "WHERE 1 = 0"; // No rang_ids found, return empty result
        }
    }
    else
    {
        conditionForQuery = "WHERE 1 = 0"; // No sub_div_id found, return empty result
    }
            }
            // RO //
            else if (getOfficersDashboardReqestModel.designation_id == 4)
            {
                conditionForQuery = "where division_id = '" + getOfficersDashboardReqestModel.devision_id + "' and rang_id = '" + getOfficersDashboardReqestModel.rang_id + "' ";
            }


            SqlCommand dashboardQuery = new SqlCommand("select * from " +
                    "(SELECT '1' as columnIndication, count(id) countOfdata, 'Total Awedan' as awedanStatus FROM online_awedan_request " + conditionForQuery + " " +
                    "union " +
                    "SELECT '2' as columnIndication, count(id) countOfdata, 'Pending Awedan' as awedanStatus FROM online_awedan_request " + conditionForQuery + " and awedan_status = 0 " +
                    "union " +
                    "SELECT '3' as columnIndication, count(id) countOfdata, 'Approved Awedan' as awedanStatus FROM online_awedan_request " + conditionForQuery + " and awedan_status = 1 " +
                    "union " +
                    "SELECT '4' as columnIndication, count(id) countOfdata, 'Reject Awedan' as awedanStatus FROM online_awedan_request " + conditionForQuery + " and awedan_status = 2" +
                    "union " +
                    "SELECT '5' as columnIndication, count(id) countOfdata, 'Withdraw Awedan' as awedanStatus FROM online_awedan_request " + conditionForQuery + " and awedan_status = 3" +
                    ") as t1 order by columnIndication", cone);
            SqlDataAdapter da = new SqlDataAdapter(dashboardQuery);

            KishanHelper.GetSqlWithParameters(dashboardQuery);

            DataTable dt = new DataTable();
            List<GetDashboardResponse> listOfDashboardData = new List<GetDashboardResponse>();
            da.Fill(dt);

            if (dt.Rows.Count > 0)
            {
                for (int i = 0; i < dt.Rows.Count; i++)
                {
                    GetDashboardResponse responseModel = new GetDashboardResponse();
                    responseModel.whichData = Convert.ToInt32(dt.Rows[i]["columnIndication"]);
                    responseModel.countOfdata = Convert.ToInt32(dt.Rows[i]["countOfdata"]);
                    responseModel.awedanStatus = Convert.ToString(dt.Rows[i]["awedanStatus"]);
                    listOfDashboardData.Add(responseModel);
                }

                SuccessFailure successFailure = new SuccessFailure();
                successFailure.code = 200;
                successFailure.msg = "list of data";

                finalArrayToReturn["response"] = successFailure;
                finalArrayToReturn["data"] = listOfDashboardData;

            }
            else
            {

                SuccessFailure successFailure = new SuccessFailure();
                successFailure.code = 100;
                successFailure.msg = "Problem to get dashboard data";

                finalArrayToReturn["response"] = successFailure;

            }

            return Ok(JsonConvert.SerializeObject(finalArrayToReturn));

        }
