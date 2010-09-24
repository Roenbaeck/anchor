package anchormodeler;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import javax.jdo.PersistenceManager;
import javax.servlet.ServletException;
import javax.servlet.http.*;

import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.FileUploadException;
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
		resp.setContentType("text/plain");

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

		} catch (FileUploadException e) {
			resp.getWriter().println("ERROR");
			resp.getWriter().println( e.toString() );
			return;
		}
		
		String action = areq.stringParams.get("action");
		action=(action == null) ? "" : action;
		action=action.toLowerCase();
		
		if (action.equals("save")) {
			actionSave(areq, resp);
		} else {
			resp.getWriter().println("ERROR: unknown action");
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
		 * slopar man detta, annars overwrite model med detta id) keywords icon
		 * (textencoded png-image) modelXml
		 * 
		 * returnerar ok/error
		 */
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

}
