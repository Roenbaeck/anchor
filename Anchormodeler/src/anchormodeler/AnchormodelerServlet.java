package anchormodeler;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.List;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.servlet.ServletException;
import javax.servlet.http.*;

import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.servlet.ServletFileUpload;


@SuppressWarnings("serial")
public class AnchormodelerServlet extends HttpServlet {

	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {
		resp.setContentType("text/plain");
		resp.getWriter().println("Anchormodeler server");
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		//resp.setContentType("text/html");
		

		ServletFileUpload upload = new ServletFileUpload();
		AnchorRequest areq = new AnchorRequest();
		try {
			FileItemIterator iterator = upload.getItemIterator(req);
			while (iterator.hasNext()) {
				FileItemStream item = iterator.next();
				if(item.isFormField()) {
					BufferedReader reader = new BufferedReader(new InputStreamReader(item.openStream()));
					String value = reader.readLine();
					areq.stringParams.put(item.getFieldName(), value);
				} else {	
					areq.fileParams.put(item.getFieldName(),item);
				}
			}
		
			String action = areq.stringParams.get("action");
			action=(action == null) ? "" : action;
			action=action.toLowerCase();
			
			if (action.equals("save")) {
				actionSave(areq, resp); 
			} else if (action.equals("load")) {
				actionLoad(areq, resp);
			} else if (action.equals("list")) {
				actionList(areq, resp);
			} else {
				resp.getWriter().println("ERROR: unknown action");
			}
			
		} catch (Exception e) {
			resp.getWriter().println("ERROR");
			resp.getWriter().println( e.toString() );
			return;
		}
	}

	@Override
	protected void doOptions(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		//http://code.google.com/p/googleappengine/issues/detail?id=2994
		// CORS requires that browsers do an OPTIONS request before allowing
		// cross-site POSTs. UMP does not require this, but no browser
		// implements
		// UMP at this time. So, we reply to the OPTIONS request to trick
		// browsers into effectively implementing UMP.
		resp.setHeader("Access-Control-Allow-Origin", "*");
		resp.setHeader("Access-Control-Allow-Methods", "GET, POST");
		resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
		resp.setHeader("Access-Control-Max-Age", "86400");
	}

	private void actionSave(AnchorRequest areq, HttpServletResponse resp) throws ServletException, IOException {
		/*
		 * scope "public","private" modelName modelId (om nytt dokument så
		 * slopar man detta, annars overwrite model med detta id) 
		 * keywords 
		 * icon (textencoded png-image)
		 * modelXml
		 * 
		 * returnerar ok/error
		 */
		//TODO: more data to save
		String modelName = areq.stringParams.get("modelName");
		String modelXml = areq.stringParams.get("modelXml");

		Model m = new Model();
		m.setModelName(modelName);
		m.setModelXml(modelXml);
		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			pm.makePersistent(m);
		} finally {
			pm.close();
		}
		resp.getWriter().println("OK");
	}

	private void actionLoad(AnchorRequest areq, HttpServletResponse resp) throws IOException {
		String modelId = areq.stringParams.get("modelId");
		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			Model m = (Model)pm.getObjectById(modelId);
			resp.getWriter().println("OK");
			resp.getWriter().println( m.getModelXml() );
		} finally {
			pm.close();
		}
	}

	@SuppressWarnings("unchecked")
	private void actionList(AnchorRequest areq, HttpServletResponse resp) throws IOException {
		/*list
		  scope "public","private","public/private"
		  filterBy "keyword"
		  filterValue "lkslejg"
		  maxItemsReturned 20
		
		  returnerar i xmlformat
		    modelId, modelName, icon, domain, keyword, authorName
		*/

		//TODO: format as xml http://www.roseindia.net/servlets/xm-servlet.shtml
		
		PersistenceManager pm = PMF.get().getPersistenceManager();
		Query query=null;
	    try {
		    query = pm.newQuery(Model.class);
		    //query.setFilter("lastName == lastNameParam");
		    //query.setOrdering("hireDate desc");
		    //query.declareParameters("String lastNameParam");

        	resp.getWriter().println("debug");
	        List<Model> results = (List<Model>) query.execute();
            for (Model m : results) {
                // ...
            	resp.getWriter().println(m.getModelName());
            }
	    } finally {
	        if(query!=null)
	        	query.closeAll();
			pm.close();
	    }		

	}
	
}
